import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '../services';
import { generateId } from '../../../utils';
import { createUserMessage, createAssistantMessage } from '../utils/messageHelper';

export const useChat = (useStreaming = true) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sessionIdRef = useRef(generateId());
  const abortControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
    return message.id;
  }, []);

  const updateMessage = useCallback((id, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  }, []);

  const removeMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  const sendMessage = useCallback(
    async (question) => {
      if (!question?.trim()) return;

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const userMessage = createUserMessage(question);
      addMessage(userMessage);

      const assistantMessage = createAssistantMessage();
      const assistantId = addMessage(assistantMessage);

      setIsLoading(true);
      setError(null);

      try {
        if (useStreaming) {
          await handleStreamingResponse(assistantId, question);
        } else {
          await handleNormalResponse(assistantId, question);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          removeMessage(assistantId);
          return;
        }

        console.error('Erro ao enviar mensagem:', err);
        setError(err?.message || 'Erro ao enviar mensagem');
        removeMessage(assistantId);
      } finally {
        setIsLoading(false);
      }
    },
    [useStreaming, addMessage, updateMessage, removeMessage]
  );

  const handleStreamingResponse = async (assistantId, question) => {
    let contentBuffer = '';

    await chatService.sendMessageStream(
      question,
      sessionIdRef.current,
      (data) => {
        if (data?.type === 'sources') {
          updateMessage(assistantId, {
            sources: Array.isArray(data.sources) ? data.sources : [],
          });
        } else if (data?.type === 'token') {
          contentBuffer += data.content ?? '';
          updateMessage(assistantId, { content: contentBuffer });
        } else if (data?.type === 'metadata') {
          updateMessage(assistantId, { modelUsed: data.model_used });
        }
      },
      (err) => {
        throw err;
      },
      () => {
        if (contentBuffer) {
          updateMessage(assistantId, { content: contentBuffer });
        }
      }
    );
  };

  const handleNormalResponse = async (assistantId, question) => {
    const response = await chatService.sendMessage(
      question,
      sessionIdRef.current
    );

    updateMessage(assistantId, {
      content: response?.answer ?? '',
      sources: Array.isArray(response?.sources) ? response.sources : [],
      modelUsed: response?.model_used ?? '',
    });
  };

  const clearMessages = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsLoading(false);
    sessionIdRef.current = generateId();
  }, []);

  const sendFeedback = useCallback(
    async (messageId, rating, comment) => {
      try {
        await chatService.sendFeedback(
          sessionIdRef.current,
          messageId,
          rating,
          comment
        );
      } catch (err) {
        console.error('Erro ao enviar feedback:', err);
      }
    },
    []
  );

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    sendFeedback,
    sessionId: sessionIdRef.current,
  };
};