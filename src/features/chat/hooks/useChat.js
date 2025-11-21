import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { chatService } from '../services';
import { generateId } from '../../../utils';
import { createUserMessage, createAssistantMessage } from '../utils/messageHelper';

/**
 * Hook para gerenciar chat
 * 
 * Com rotas dinâmicas, o sessionId vem da URL via props.
 * Quando a URL muda, o componente ChatInterface é remontado (via key),
 * garantindo estado limpo a cada troca de conversa.
 * 
 * @param {boolean} useStreaming - Usar streaming SSE
 * @param {string|null} initialSessionId - ID da sessão (vem da URL)
 */
export const useChat = (useStreaming = true, initialSessionId = null) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { isAuthenticated } = useAuth();
  
  // Session ID - inicializa com o da URL ou gera novo
  const sessionIdRef = useRef(initialSessionId || generateId());
  
  // AbortController para requisições
  const abortControllerRef = useRef(null);

  /**
   * Carrega histórico ao montar o componente
   * Como o componente é remontado quando sessionId muda (via key no Chat.jsx),
   * este effect só roda uma vez por "instância" do componente
   */
  useEffect(() => {
    // Se não tem sessionId ou não está autenticado, não carrega histórico
    if (!initialSessionId || !isAuthenticated) {
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setError(null);

      try {
        const history = await chatService.getChatHistory(initialSessionId);
        
        // Verifica se foi abortado
        if (abortController.signal.aborted) return;

        const loadedMessages = history?.messages || [];
        setMessages(loadedMessages);
        
        console.debug('[useChat] Histórico carregado:', {
          sessionId: initialSessionId,
          count: loadedMessages.length
        });
      } catch (err) {
        if (abortController.signal.aborted) return;
        
        console.debug('[useChat] Erro ao carregar histórico:', err?.message);
        
        // 404 = conversa nova, não é erro
        if (!err?.message?.includes('404')) {
          if (err?.message?.includes('403')) {
            setError('Esta conversa não pode ser acessada.');
          }
        }
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
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

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
   * Para geração
   */
  const stopGeneration = useCallback(async () => {
    await chatService.cancelStream(sessionIdRef.current);
    chatService.abortStream();
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  /**
   * Processa streaming
   */
  const handleStreamingResponse = useCallback(async (question, addMsgFn, updateMsgFn) => {
    let contentBuffer = '';
    let assistantId = null;
    let backendSessionId = null;

    await chatService.sendMessageStream(
      question,
      sessionIdRef.current,
      (data) => {
        if (!assistantId && (data?.type === 'token' || data?.type === 'sources' || data?.type === 'metadata')) {
          const msg = createAssistantMessage();
          assistantId = addMsgFn(msg);
        }

        switch (data?.type) {
          case 'sources':
            updateMsgFn(assistantId, { sources: data.sources || [] });
            break;
          case 'confidence':
            if (typeof data.confidence === 'number') {
              updateMsgFn(assistantId, { confidence: data.confidence });
            }
            break;
          case 'token':
            if (!contentBuffer) {
              setIsLoading(false);
              setIsStreaming(true);
            }
            contentBuffer += data.content ?? '';
            updateMsgFn(assistantId, { content: contentBuffer });
            break;
          case 'metadata':
            updateMsgFn(assistantId, { modelUsed: data.model_used });
            if (data.session_id) backendSessionId = data.session_id;
            if (typeof data.confidence === 'number') {
              updateMsgFn(assistantId, { confidence: data.confidence });
            }
            break;
          case 'done':
            setIsStreaming(false);
            break;
        }
      },
      (err) => {
        setIsStreaming(false);
        throw err;
      },
      () => {
        if (backendSessionId) {
          sessionIdRef.current = backendSessionId;
        }
        if (contentBuffer && assistantId) {
          updateMsgFn(assistantId, { content: contentBuffer });
        }
        setIsStreaming(false);
      }
    );

    return { assistantId, backendSessionId };
  }, []);

  /**
   * Processa resposta normal
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
      if (useStreaming) {
        const result = await handleStreamingResponse(question, addMessage, updateMessage);
        assistantId = result.assistantId;
        // Notifica sobre nova sessão criada
        if (result.backendSessionId && !initialSessionId) {
          onSessionCreated?.(result.backendSessionId);
        }
      } else {
        const msg = createAssistantMessage();
        assistantId = addMessage(msg);
        const newSessionId = await handleNormalResponse(assistantId, question, updateMessage);
        if (newSessionId && !initialSessionId) {
          onSessionCreated?.(newSessionId);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        if (assistantId) removeMessage(assistantId);
        return;
      }
      console.error('[useChat] Erro:', err);
      setError(err?.message || 'Erro ao enviar mensagem');
      if (assistantId) removeMessage(assistantId);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [useStreaming, initialSessionId, addMessage, updateMessage, removeMessage, handleStreamingResponse, handleNormalResponse]);

  /**
   * Limpa mensagens
   */
  const clearMessages = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsStreaming(false);
    sessionIdRef.current = generateId();
  }, []);

  /**
   * Envia feedback
   */
  const sendFeedback = useCallback(async (messageId, rating, comment = null) => {
    try {
      await chatService.sendFeedback(sessionIdRef.current, messageId, rating, comment);
      return { success: true };
    } catch (err) {
      console.error('[useChat] Erro feedback:', err);
      return { success: false, error: err.message };
    }
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
    sendFeedback,
  };
};