import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { chatService } from '../services';
import { generateId } from '../../../utils';
import { createUserMessage, createAssistantMessage } from '../utils/messageHelper';

/**
 * Hook customizado para gerenciar chat
 * Sincronizado com backend - suporta histórico e persistência
 * 
 * @param {boolean} useStreaming - Usar streaming SSE ou resposta completa
 * @param {string|null} initialSessionId - ID de sessão existente (para carregar histórico)
 * @returns {object} Estado e métodos do chat
 */
export const useChat = (useStreaming = true, initialSessionId = null) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { isAuthenticated } = useAuth();
  const sessionIdRef = useRef(initialSessionId || generateId());
  const abortControllerRef = useRef(null);

  /**
   * Carrega histórico de mensagens ao montar o componente
   * Apenas se usuário estiver autenticado e houver sessionId válido
   *
   * FIX: Limpa mensagens imediatamente ao trocar de sessão para evitar flickering
   */
  useEffect(() => {
    const loadHistory = async () => {
      // Não carrega se não está autenticado ou não tem sessionId
      if (!isAuthenticated || !initialSessionId) return;

      // FIX: Limpa mensagens antigas IMEDIATAMENTE ao trocar de sessão
      // Isso previne flickering e exibição de conteúdo errado
      setMessages([]);
      setIsLoadingHistory(true);
      setError(null);

      // FIX: Atualiza sessionIdRef para a sessão sendo carregada
      sessionIdRef.current = initialSessionId;

      try {
        // chatService.getChatHistory já retorna dados adaptados
        const history = await chatService.getChatHistory(initialSessionId);

        // Só atualiza se realmente há mensagens
        const loadedMessages = history.messages || [];
        if (loadedMessages.length > 0) {
          setMessages(loadedMessages);
        }
      } catch (error) {
        // Log silencioso para debug
        console.debug('Histórico não carregado:', error?.message);

        // Apenas mostra erro para problemas de permissão
        if (error?.message?.includes('403') || error?.message?.includes('permissão')) {
          setError('Esta conversa não pode ser acessada.');
          setMessages([]);
        }
        // 404 e outros erros são silenciosos (normal para novas conversas)
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [isAuthenticated, initialSessionId]);

  /**
   * Cleanup - cancela requisições pendentes
   */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  /**
   * Adiciona uma nova mensagem à lista
   */
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
    return message.id;
  }, []);

  /**
   * Atualiza uma mensagem existente
   */
  const updateMessage = useCallback((id, updates) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg))
    );
  }, []);

  /**
   * Remove uma mensagem da lista
   */
  const removeMessage = useCallback((id) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  }, []);

  /**
   * Para a geração em andamento
   * 1. Cancela no backend (envia DELETE para /chat/stream/{session_id})
   * 2. Aborta o stream no frontend (fecha conexão SSE)
   */
  const stopGeneration = useCallback(async () => {
    // Primeiro: cancela no backend para parar a geração imediatamente
    await chatService.cancelStream(sessionIdRef.current);

    // Segundo: aborta o stream no frontend (fecha conexão)
    chatService.abortStream();

    // Atualiza estados da UI
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  /**
   * Envia uma mensagem para o chat
   */
  const sendMessage = useCallback(
    async (question) => {
      if (!question?.trim()) return;

      // Cancela requisição anterior se existir
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      // Adiciona mensagem do usuário
      const userMessage = createUserMessage(question);
      addMessage(userMessage);

      setIsLoading(true);
      setIsStreaming(false);
      setError(null);

      let assistantId = null;

      try {
        if (useStreaming) {
          assistantId = await handleStreamingResponse(question);
        } else {
          const assistantMessage = createAssistantMessage();
          assistantId = addMessage(assistantMessage);
          await handleNormalResponse(assistantId, question);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          if (assistantId) removeMessage(assistantId);
          return;
        }

        console.error('Erro ao enviar mensagem:', err);
        setError(err?.message || 'Erro ao enviar mensagem');
        if (assistantId) removeMessage(assistantId);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [useStreaming, addMessage, updateMessage, removeMessage]
  );

  /**
   * Processa resposta com streaming
   * @private
   */
  const handleStreamingResponse = async (question) => {
    let contentBuffer = '';
    let assistantId = null;
    let backendSessionId = null;

    await chatService.sendMessageStream(
      question,
      sessionIdRef.current,
      (data) => {
        // Cria mensagem do assistente no primeiro evento
        if (!assistantId && (data?.type === 'token' || data?.type === 'sources' || data?.type === 'metadata')) {
          const assistantMessage = createAssistantMessage();
          assistantId = addMessage(assistantMessage);
        }

        // Processa diferentes tipos de eventos SSE
        switch (data?.type) {
          case 'sources':
            updateMessage(assistantId, {
              sources: Array.isArray(data.sources) ? data.sources : [],
            });
            break;

          case 'confidence':
            if (typeof data.confidence === 'number') {
              updateMessage(assistantId, {
                confidence: data.confidence,
              });
            }
            break;

          case 'token':
            // Quando recebe o primeiro token, seta isStreaming para true e isLoading para false
            if (!contentBuffer) {
              setIsLoading(false);
              setIsStreaming(true);
            }
            contentBuffer += data.content ?? '';
            updateMessage(assistantId, { content: contentBuffer });
            break;

          case 'metadata':
            updateMessage(assistantId, {
              modelUsed: data.model_used,
            });
            // Armazena session_id retornado pelo backend
            if (data.session_id) {
              backendSessionId = data.session_id;
            }
            // Atualiza confidence se vier no metadata também
            if (typeof data.confidence === 'number') {
              updateMessage(assistantId, {
                confidence: data.confidence,
              });
            }
            break;

          case 'done':
            // Streaming finalizado
            setIsStreaming(false);
            break;
        }
      },
      (err) => {
        setIsStreaming(false);
        throw err;
      },
      () => {
        // Atualiza session_id com o retornado pelo backend (para sincronizar)
        if (backendSessionId) {
          sessionIdRef.current = backendSessionId;
        }

        // Garante que conteúdo final está salvo
        if (contentBuffer && assistantId) {
          updateMessage(assistantId, { content: contentBuffer });
        }

        // Garante que isStreaming está false ao finalizar
        setIsStreaming(false);
      }
    );

    return assistantId;
  };

  /**
   * Processa resposta sem streaming
   * @private
   */
  const handleNormalResponse = async (assistantId, question) => {
    const response = await chatService.sendMessage(
      question,
      sessionIdRef.current
    );

    // Atualiza session_id com o retornado pelo backend
    if (response.sessionId) {
      sessionIdRef.current = response.sessionId;
    }

    updateMessage(assistantId, {
      content: response?.content ?? '',
      sources: Array.isArray(response?.sources) ? response.sources : [],
      modelUsed: response?.modelUsed ?? '',
      confidence: response?.confidence,
    });
  };

  /**
   * Limpa todas as mensagens e cria nova sessão
   */
  const clearMessages = useCallback(() => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsLoading(false);
    
    // Gera novo session_id para nova conversa
    sessionIdRef.current = generateId();
  }, []);

  /**
   * Envia feedback sobre uma mensagem
   */
  const sendFeedback = useCallback(
    async (messageId, rating, comment = null) => {
      try {
        await chatService.sendFeedback(
          sessionIdRef.current,
          messageId,
          rating,
          comment
        );
        return { success: true };
      } catch (err) {
        console.error('Erro ao enviar feedback:', err);
        return { success: false, error: err.message };
      }
    },
    []
  );

  /**
   * REMOVIDA: loadSessionHistory
   * O carregamento de histórico agora é feito automaticamente pelo useEffect acima
   * quando initialSessionId muda, eliminando código duplicado e requisições duplicadas
   */

  return {
    // Estado
    messages,
    isLoading,
    isStreaming,
    isLoadingHistory,
    error,
    sessionId: sessionIdRef.current,

    // Métodos
    sendMessage,
    stopGeneration,
    clearMessages,
    sendFeedback,
  };
};