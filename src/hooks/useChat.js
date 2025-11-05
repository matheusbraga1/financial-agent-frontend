// useChat.js
import { useState, useCallback, useRef, useEffect } from "react";
import { chatService } from "../services/api";

// Gera IDs estáveis (funciona no browser e SSR)
const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export const useChat = (useStreaming = true) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // requisição iniciada (até 1º token ou resposta completa)
  const [isStreaming, setIsStreaming] = useState(false); // recebendo tokens
  const [error, setError] = useState(null);

  // sessionId persiste durante a vida do hook
  const sessionIdRef = useRef(newId());

  // buffers para reduzir re-renders durante streaming
  const tokenBufferRef = useRef("");
  const flushTimerRef = useRef(null);
  const firstTokenReceivedRef = useRef(false);

  // garante limpeza de timers ao desmontar
  useEffect(() => {
    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
      tokenBufferRef.current = "";
    };
  }, []);

  // agenda um flush a ~30fps
  const scheduleFlush = (assistantMessageId) => {
    if (flushTimerRef.current) return;
    flushTimerRef.current = setTimeout(() => {
      const chunk = tokenBufferRef.current;
      tokenBufferRef.current = "";
      flushTimerRef.current = null;
      if (!chunk) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: msg.content + chunk }
            : msg
        )
      );
    }, 32);
  };

  const sendMessage = useCallback(
    async (question) => {
      if (!question?.trim()) return;

      // Mensagem do usuário
      const userMessage = {
        id: newId(),
        type: "user",
        content: question,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Estados de carregamento/stream
      setIsLoading(true);
      setIsStreaming(false);
      setError(null);
      firstTokenReceivedRef.current = false;

      // Mensagem do assistente (placeholder)
      const assistantMessageId = newId();
      const assistantMessage = {
        id: assistantMessageId,
        type: "assistant",
        content: "",
        sources: [],
        timestamp: new Date(),
        modelUsed: "",
        serverMessageId: null, // preenchido se backend mandar (via metadata)
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        if (useStreaming) {
          tokenBufferRef.current = "";

          await chatService.sendMessageStream(
            question,
            sessionIdRef.current,
            // onMessage
            (data) => {
              // ao receber primeiro token: parar "isLoading" e marcar "isStreaming"
              if (!firstTokenReceivedRef.current && data?.type === "token") {
                firstTokenReceivedRef.current = true;
                setIsLoading(false);
                setIsStreaming(true);
              }

              if (data?.type === "sources") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          sources: Array.isArray(data.sources)
                            ? data.sources
                            : [],
                        }
                      : msg
                  )
                );
              } else if (data?.type === "token") {
                tokenBufferRef.current += data.content ?? "";
                scheduleFlush(assistantMessageId);
              } else if (data?.type === "metadata") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          modelUsed: data.model_used ?? msg.modelUsed,
                          serverMessageId:
                            data.message_id ?? msg.serverMessageId,
                        }
                      : msg
                  )
                );
              }
            },
            // onError
            (err) => {
              console.error("Erro no streaming:", err);
              setError("Erro ao processar resposta. Tente novamente.");
              setIsLoading(false);
              setIsStreaming(false);

              // Remover placeholder do assistente em caso de falha
              setMessages((prev) =>
                prev.filter((msg) => msg.id !== assistantMessageId)
              );
            },
            // onComplete
            () => {
              // flush final do que sobrou no buffer
              if (tokenBufferRef.current) {
                const chunk = tokenBufferRef.current;
                tokenBufferRef.current = "";
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: msg.content + chunk }
                      : msg
                  )
                );
              }
              setIsLoading(false);
              setIsStreaming(false);
            }
          );
        } else {
          // Resposta "não-stream"
          const response = await chatService.sendMessage(
            question,
            sessionIdRef.current
          );

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: response?.answer ?? "",
                    sources: Array.isArray(response?.sources)
                      ? response.sources
                      : [],
                    modelUsed: response?.model_used ?? "",
                    serverMessageId: response?.message_id ?? null,
                  }
                : msg
            )
          );

          setIsLoading(false);
          setIsStreaming(false);
        }
      } catch (err) {
        console.error("Erro ao enviar mensagem:", err);
        setError(err?.message || "Erro ao enviar mensagem");
        setIsLoading(false);
        setIsStreaming(false);

        // Remove placeholder do assistente se a chamada falhar
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== assistantMessageId)
        );
      }
    },
    [useStreaming]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
    sessionIdRef.current = newId();

    // limpar buffers/timers do streaming
    tokenBufferRef.current = "";
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    firstTokenReceivedRef.current = false;
  }, []);

  const sendFeedback = useCallback(
    async (messageId, rating, comment) => {
      try {
        // tentar usar o ID do backend quando disponível
        const target = messages.find((m) => m.id === messageId);
        const backendId = target?.serverMessageId ?? messageId;

        await chatService.sendFeedback(
          sessionIdRef.current,
          backendId,
          rating,
          comment
        );
      } catch (err) {
        console.error("Erro ao enviar feedback:", err);
        // Opcional: setError('Não foi possível enviar o feedback.');
      }
    },
    [messages]
  );

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
    sendFeedback,
    sessionId: sessionIdRef.current,
  };
};
