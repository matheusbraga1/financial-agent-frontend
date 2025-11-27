import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { chatService } from '../services';
import { streamManager } from '../services/streamManager';
import { generateId } from '../../../utils';
import { createUserMessage, createAssistantMessage } from '../utils/messageHelper';

/**
 * Hook para gerenciar chat
 *
 * Com rotas dinâmicas, o sessionId vem da URL via props.
 * Quando a URL muda, o componente ChatInterface é remontado (via key),
 * garantindo estado limpo a cada troca de conversa.
 *
 * Utiliza StreamManager global para manter streams ativos em background.
 *
 * @param {boolean} useStreaming - Usar streaming SSE
 * @param {string|null} initialSessionId - ID da sessão (vem da URL)
 */
export const useChat = (useStreaming = true, initialSessionId = null) => {
  console.log('🔵 [useChat] COMPONENTE EXECUTADO - initialSessionId:', initialSessionId);

  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { isAuthenticated } = useAuth();

  // Session ID - inicializa com o da URL ou gera novo
  const sessionIdRef = useRef(initialSessionId || generateId());

  // ID da mensagem do assistente atual (para sincronizar com stream global)
  const currentAssistantIdRef = useRef(null);

  // AbortController para requisições de histórico
  const abortControllerRef = useRef(null);

  // Rastreia se já carregamos histórico para este sessionId
  const loadedSessionIdRef = useRef(null);

  // Sincroniza sessionIdRef com initialSessionId
  useEffect(() => {
    if (!initialSessionId) {
      sessionIdRef.current = generateId();
      console.debug('[useChat] Nova sessão iniciada:', sessionIdRef.current);
    } else if (sessionIdRef.current !== initialSessionId) {
      sessionIdRef.current = initialSessionId;
      console.debug('[useChat] Sessão sincronizada:', sessionIdRef.current);
    }
  }, [initialSessionId]);

  /**
   * Sincroniza estado local com StreamManager global
   */
  useEffect(() => {
    // Subscreve para atualizações do stream desta sessão
    // Usa sessionIdRef para sempre pegar o valor mais atual
    const unsubscribe = streamManager.subscribe((updatedSessionId, state) => {
      const currentSessionId = sessionIdRef.current;
      if (updatedSessionId !== currentSessionId) return;

      if (!state) return;

      // Atualiza estados de loading/streaming
      setIsLoading(state.isLoading);
      setIsStreaming(state.isStreaming);

      if (state.error) {
        setError(state.error.message);
      }

      // Atualiza conteúdo da mensagem do assistente
      if (currentAssistantIdRef.current && state.content !== undefined) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === currentAssistantIdRef.current
              ? {
                  ...msg,
                  content: state.content,
                  sources: state.sources || msg.sources || [],
                  confidence: state.confidence ?? msg.confidence,
                  modelUsed: state.modelUsed || msg.modelUsed,
                }
              : msg
          )
        );
      }

      // Se stream terminou, limpa referência
      if (!state.isStreaming && !state.isLoading && currentAssistantIdRef.current) {
        currentAssistantIdRef.current = null;
      }
    });

    // Verifica se há stream ativo ao montar (reconexão)
    const existingState = streamManager.getStreamState(sessionIdRef.current);
    if (existingState && (existingState.isStreaming || existingState.isLoading)) {
      setIsLoading(existingState.isLoading);
      setIsStreaming(existingState.isStreaming);

      // Se há conteúdo e messageId, reconstrói a mensagem
      if (existingState.messageId && existingState.content) {
        currentAssistantIdRef.current = existingState.messageId;
      }
    }

    return unsubscribe;
  }, []);

  /**
   * Carrega histórico ao montar o componente
   */
  useEffect(() => {
    console.debug('[useChat] useEffect carregamento - initialSessionId:', initialSessionId, 'isAuthenticated:', isAuthenticated);

    if (!initialSessionId || !isAuthenticated) {
      console.debug('[useChat] Pulando carregamento - sem sessionId ou não autenticado');
      setIsLoadingHistory(false);
      return;
    }

    // Se já carregamos histórico para este sessionId, não carrega novamente
    // Isso evita recarregar quando URL muda de /chat para /chat/sessionId
    if (loadedSessionIdRef.current === initialSessionId) {
      console.debug('[useChat] Pulando carregamento - já carregado para:', initialSessionId);
      setIsLoadingHistory(false);
      return;
    }

    // Se já temos mensagens no estado, não carrega histórico
    // Isso acontece quando URL muda de /chat para /chat/sessionId durante a mesma conversa
    if (messages.length > 0) {
      console.debug('[useChat] Pulando carregamento - já há', messages.length, 'mensagens no estado');
      loadedSessionIdRef.current = initialSessionId;
      setIsLoadingHistory(false);
      return;
    }

    console.debug('[useChat] Iniciando carregamento de histórico para:', initialSessionId);
    // Marca como carregado
    loadedSessionIdRef.current = initialSessionId;

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setError(null);

      try {
        const history = await chatService.getChatHistory(initialSessionId);

        if (abortController.signal.aborted) return;

        const loadedMessages = history?.messages || [];

        // Só substitui mensagens se de fato carregou algo
        // Evita limpar mensagens quando histórico ainda não foi salvo (404)
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        }

        // Verifica se há stream ativo para esta sessão
        const streamState = streamManager.getStreamState(initialSessionId);
        if (streamState && (streamState.isStreaming || streamState.isLoading)) {
          // Se o stream tem conteúdo que ainda não está nas mensagens, adiciona
          if (streamState.messageId) {
            const hasMessage = loadedMessages.some(m => m.id === streamState.messageId);
            if (!hasMessage && streamState.content) {
              const assistantMsg = createAssistantMessage();
              assistantMsg.id = streamState.messageId;
              assistantMsg.content = streamState.content;
              assistantMsg.sources = streamState.sources || [];
              assistantMsg.confidence = streamState.confidence;
              assistantMsg.modelUsed = streamState.modelUsed || '';
              setMessages(prev => [...prev, assistantMsg]);
            }
            currentAssistantIdRef.current = streamState.messageId;
          }
          setIsLoading(streamState.isLoading);
          setIsStreaming(streamState.isStreaming);
        }

        console.debug('[useChat] Histórico carregado:', {
          sessionId: initialSessionId,
          count: loadedMessages.length
        });
      } catch (err) {
        if (abortController.signal.aborted) return;

        console.debug('[useChat] Erro ao carregar histórico:', err?.message);

        if (!err?.message?.includes('404')) {
          if (err?.message?.includes('403')) {
            setError('Esta conversa não pode ser acessada.');
          }
        }
        // Se for 404, apenas ignora (conversa ainda não foi salva)
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();

    return () => {
      abortController.abort();
    };
  }, [initialSessionId, isAuthenticated]);

  /**
   * Adiciona mensagem
   */
  const addMessage = useCallback((message) => {
    setMessages(prev => [...prev, message]);
    return message.id;
  }, []);

  /**
   * Atualiza mensagem
   */
  const updateMessage = useCallback((id, updates) => {
    setMessages(prev =>
      prev.map(msg => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  }, []);

  /**
   * Remove mensagem
   */
  const removeMessage = useCallback((id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  /**
   * Para geração - cancela via StreamManager global
   */
  const stopGeneration = useCallback(async () => {
    // Marca mensagem atual como interrompida
    if (currentAssistantIdRef.current) {
      updateMessage(currentAssistantIdRef.current, {
        content: '[Interrompido pelo usuário]',
        isInterrupted: true,
      });
      currentAssistantIdRef.current = null;
    }

    streamManager.cancelStream(sessionIdRef.current);
    setIsStreaming(false);
    setIsLoading(false);
  }, [updateMessage]);

  /**
   * Processa streaming via StreamManager global
   */
  const handleStreamingResponse = useCallback(async (question, assistantId) => {
    currentAssistantIdRef.current = assistantId;

    const result = await streamManager.startStream(
      question,
      sessionIdRef.current,
      assistantId
    );

    return { assistantId, backendSessionId: result.backendSessionId };
  }, []);

  /**
   * Processa resposta normal (sem streaming)
   */
  const handleNormalResponse = useCallback(async (assistantId, question, updateMsgFn) => {
    const response = await chatService.sendMessage(question, sessionIdRef.current);

    if (response.sessionId) {
      sessionIdRef.current = response.sessionId;
    }

    updateMsgFn(assistantId, {
      content: response?.content ?? '',
      sources: response?.sources || [],
      modelUsed: response?.modelUsed ?? '',
      confidence: response?.confidence,
    });

    return response.sessionId;
  }, []);

  /**
   * Envia mensagem
   */
  const sendMessage = useCallback(async (question, onSessionCreated) => {
    if (!question?.trim()) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    const userMessage = createUserMessage(question);
    addMessage(userMessage);

    setIsLoading(true);
    setIsStreaming(false);
    setError(null);

    let assistantId = null;

    try {
      // Cria mensagem do assistente
      const msg = createAssistantMessage();
      assistantId = addMessage(msg);

      if (useStreaming) {
        const result = await handleStreamingResponse(question, assistantId);
        // Notifica sobre o sessionId retornado pelo backend
        if (!initialSessionId && result.backendSessionId) {
          onSessionCreated?.(result.backendSessionId);
        }
      } else {
        const newSessionId = await handleNormalResponse(assistantId, question, updateMessage);
        // Notifica sobre o sessionId retornado pelo backend
        if (!initialSessionId && newSessionId) {
          onSessionCreated?.(newSessionId);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.debug('[useChat] Stream cancelado, mantendo mensagem parcial');
        return;
      }
      console.error('[useChat] Erro:', err);
      setError(err?.message || 'Erro ao enviar mensagem');
      if (assistantId) removeMessage(assistantId);
    } finally {
      // Estados são gerenciados pelo StreamManager para streaming
      if (!useStreaming) {
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  }, [useStreaming, initialSessionId, addMessage, updateMessage, removeMessage, handleStreamingResponse, handleNormalResponse]);

  /**
   * Limpa mensagens
   */
  const clearMessages = useCallback(() => {
    abortControllerRef.current?.abort();
    streamManager.cancelStream(sessionIdRef.current);
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
    sessionIdRef.current = generateId();
    currentAssistantIdRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    isLoadingHistory,
    error,
    sessionId: sessionIdRef.current,
    sendMessage,
    stopGeneration,
    clearMessages,
  };
};
