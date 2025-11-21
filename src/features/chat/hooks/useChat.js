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
  // Estado para sessionId - dispara re-render quando backend retorna novo ID
  const [currentSessionId, setCurrentSessionId] = useState(initialSessionId || generateId());
  // Flag para indicar se é uma sessão nova (não carregada do histórico)
  const [isNewSession, setIsNewSession] = useState(!initialSessionId);

  const { isAuthenticated } = useAuth();
  const sessionIdRef = useRef(currentSessionId);
  const abortControllerRef = useRef(null);

  // Ref para rastrear a última sessão carregada e evitar carregamentos duplicados
  const previousSessionIdRef = useRef(null);
  const isLoadingRef = useRef(false);
  // Ref para abort controller do carregamento de histórico
  const historyAbortControllerRef = useRef(null);

  // Mantém ref sincronizado com state
  useEffect(() => {
    sessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  /**
   * Carrega histórico de mensagens quando initialSessionId muda
   * - Sincroniza currentSessionId com initialSessionId
   * - Usa abort controller para cancelar requests obsoletos
   * - Carrega do backend apenas se necessário
   */
  useEffect(() => {
    // Normaliza IDs para comparação consistente
    const normalizedInitialId = initialSessionId ? String(initialSessionId) : null;
    const normalizedCurrentId = currentSessionId ? String(currentSessionId) : null;
    const normalizedPreviousId = previousSessionIdRef.current ? String(previousSessionIdRef.current) : null;

    // Se não tem initialSessionId, é uma nova conversa
    if (!normalizedInitialId) {
      // Cancela qualquer carregamento em andamento
      historyAbortControllerRef.current?.abort();

      // Só gera novo ID se:
      // 1. Não temos currentSessionId OU
      // 2. previousSessionIdRef.current é diferente de currentSessionId (indica reset)
      // IMPORTANTE: Não resetar se currentSessionId já existe e é diferente do previous
      // (isso evita o bug de clicar duas vezes na mesma conversa)
      const needsReset = !normalizedCurrentId ||
        (normalizedPreviousId !== null && normalizedPreviousId !== normalizedCurrentId);

      if (needsReset) {
        const newId = generateId();
        setCurrentSessionId(newId);
        setMessages([]);
        setIsNewSession(true); // Nova conversa
        previousSessionIdRef.current = null;
      }
      return;
    }

    // Sincroniza currentSessionId com initialSessionId
    if (normalizedCurrentId !== normalizedInitialId) {
      setCurrentSessionId(normalizedInitialId);
    }

    // IMPORTANTE: Se é a mesma sessão que já está carregada, não faz nada
    // Isso evita o bug de clicar duas vezes na mesma conversa
    if (normalizedPreviousId === normalizedInitialId) {
      return;
    }

    // Não carrega se não autenticado
    if (!isAuthenticated) {
      return;
    }

    // Cancela qualquer carregamento anterior antes de iniciar novo
    historyAbortControllerRef.current?.abort();

    // Cria novo abort controller para esta operação
    const abortController = new AbortController();
    historyAbortControllerRef.current = abortController;

    // Marca como sessão carregada do histórico (não nova)
    setIsNewSession(false);

    // Marca imediatamente como carregando esta sessão para bloquear chamadas duplicadas
    previousSessionIdRef.current = normalizedInitialId;
    isLoadingRef.current = true;

    const loadHistory = async () => {
      // Verifica se já foi cancelado antes de limpar mensagens
      if (abortController.signal.aborted) {
        return;
      }

      setMessages([]);
      setIsLoadingHistory(true);
      setError(null);
      sessionIdRef.current = normalizedInitialId;

      try {
        const history = await chatService.getChatHistory(normalizedInitialId);

        // Verifica se foi cancelado durante o fetch
        if (abortController.signal.aborted) {
          return;
        }

        const loadedMessages = history.messages || [];

        // Verifica se ainda é a sessão atual antes de atualizar
        if (previousSessionIdRef.current === normalizedInitialId) {
          setMessages(loadedMessages);
        }
      } catch (error) {
        // Ignora erros de abort
        if (error?.name === 'AbortError' || abortController.signal.aborted) {
          return;
        }

        console.debug('Histórico não carregado:', error?.message);

        if (error?.message?.includes('403') || error?.message?.includes('permissão')) {
          setError('Esta conversa não pode ser acessada.');
        }
        // 404 e outros erros são silenciosos (sessão nova ou inexistente)
      } finally {
        // Só atualiza flags se não foi cancelado
        if (!abortController.signal.aborted) {
          setIsLoadingHistory(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadHistory();

    // Cleanup: cancela request quando effect re-executa ou componente desmonta
    return () => {
      abortController.abort();
      // IMPORTANTE: Reset refs se ainda apontam para esta sessão
      // Isso permite que re-execuções do effect (React Strict Mode) carreguem corretamente
      if (previousSessionIdRef.current === normalizedInitialId) {
        previousSessionIdRef.current = null;
        isLoadingRef.current = false;
      }
    };
  }, [isAuthenticated, initialSessionId]);

  /**
   * Cleanup - cancela requisições pendentes (mensagens e histórico)
   */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      historyAbortControllerRef.current?.abort();
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
    let backendSessionId = null;

    // Cria mensagem do assistente IMEDIATAMENTE para mostrar ThinkingIndicator
    const assistantMessage = createAssistantMessage();
    const assistantId = addMessage(assistantMessage);

    await chatService.sendMessageStream(
      question,
      sessionIdRef.current,
      (data) => {

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
        // Usa setState para disparar re-render e notificar componente pai
        // Normaliza para string para garantir comparação consistente
        if (backendSessionId) {
          const normalizedBackendId = String(backendSessionId);
          setCurrentSessionId(normalizedBackendId);
          // Marca como já processada para evitar reload quando parent sincronizar
          previousSessionIdRef.current = normalizedBackendId;
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
    // Normaliza para string para garantir comparação consistente
    if (response.sessionId) {
      const normalizedBackendId = String(response.sessionId);
      setCurrentSessionId(normalizedBackendId);
      // Marca como já processada para evitar reload quando parent sincronizar
      previousSessionIdRef.current = normalizedBackendId;
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
    setIsNewSession(true); // Nova conversa

    // Gera novo session_id para nova conversa
    const newSessionId = generateId();
    setCurrentSessionId(newSessionId);
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
    isNewSession, // Flag para indicar se é sessão nova (não carregada)
    error,
    sessionId: currentSessionId,

    // Métodos
    sendMessage,
    stopGeneration,
    clearMessages,
    sendFeedback,
  };
};