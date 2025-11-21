import { apiClient } from '../../../services/api/axios.config';
import { config } from '../../../config/env';
import { handleApiError } from '../../../utils';
import { STREAM_TIMEOUT } from '../../../constants/apiConstants';
import { CHAT_ERRORS, NETWORK_ERRORS } from '../../../constants/errorMessages';
import {
  adaptChatHistory,
  adaptSessions,
  adaptStreamEvent,
  adaptChatResponse,
  prepareFeedbackPayload,
} from '../adapters/chatAdapter';

/**
 * Serviço de Chat - Comunicação com a API de Chat
 * Sincronizado com backend FastAPI
 * Usa mensagens de erro padronizadas e profissionais
 */
class ChatService {
  constructor() {
    // Armazena o AbortController atual para permitir cancelamento
    this.currentStreamController = null;
  }

  /**
   * Envia mensagem e recebe resposta completa (sem streaming)
   * @param {string} question - Pergunta do usuário
   * @param {string|null} sessionId - ID da sessão (opcional)
   * @returns {Promise<{content: string, sources: Array, modelUsed: string, sessionId: string}>}
   */
  async sendMessage(question, sessionId = null) {
    try {
      const response = await apiClient.post('/chat', {
        question,
        session_id: sessionId
      });

      // Adapta a resposta do backend para o formato do frontend
      return adaptChatResponse(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Aborta o streaming atual e cancela a geração no backend
   *
   * O backend detecta automaticamente a desconexão do cliente via GeneratorExit
   * e seta o cancel_event para interromper a geração do LLM.
   * Não é necessário endpoint separado - o AbortController é suficiente.
   *
   * @see backend: chat.py - GeneratorExit handler + cancel_event
   */
  abortStream() {
    if (this.currentStreamController) {
      this.currentStreamController.abort();
      this.currentStreamController = null;
    }
  }

  /**
   * Cancela o streaming da sessão atual
   *
   * Alias para abortStream() - mantido para compatibilidade de API.
   * O cancelamento server-side é automático quando a conexão é fechada.
   */
  cancelStream() {
    this.abortStream();
  }

  /**
   * Envia mensagem com resposta em streaming (SSE)
   * @param {string} question - Pergunta do usuário
   * @param {string|null} sessionId - ID da sessão
   * @param {Function} onMessage - Callback para cada evento SSE
   * @param {Function} onError - Callback para erros
   * @param {Function} onComplete - Callback quando streaming finaliza
   */
  async sendMessageStream(question, sessionId, onMessage, onError, onComplete) {
    const url = `${config.apiUrl}/chat/stream`;

    // Aborta stream anterior se existir
    this.abortStream();

    // Cria novo controller e armazena
    this.currentStreamController = new AbortController();
    const controller = this.currentStreamController;
    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT);

    try {
      const token = localStorage.getItem('auth_token');

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question,
          session_id: sessionId
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;

        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorMessage;
        } catch {
          // Se não for JSON, usar mensagem padrão
        }

        throw new Error(errorMessage);
      }

      await this._processStream(response, onMessage, onComplete);
    } catch (error) {
      console.error('Erro no streaming:', error);

      // Se foi abortado manualmente pelo usuário, não mostra erro
      if (error.name === 'AbortError' && !controller.signal.aborted) {
        // Silenciosamente retorna - usuário clicou em parar
        return;
      }

      let errorObj;

      // Timeout
      if (error.name === 'AbortError') {
        errorObj = NETWORK_ERRORS.TIMEOUT;
      }
      // Erro de rede/conexão
      else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorObj = NETWORK_ERRORS.NO_CONNECTION;
      }
      // Erro do servidor
      else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
        errorObj = NETWORK_ERRORS.SERVER_ERROR;
      }
      // Rate limit
      else if (error.message.includes('429')) {
        errorObj = NETWORK_ERRORS.RATE_LIMIT;
      }
      // Conexão de stream interrompida
      else if (error.message.includes('stream') || error.message.includes('connection')) {
        errorObj = CHAT_ERRORS.STREAM_CONNECTION_FAILED;
      }
      // Erro genérico
      else {
        errorObj = {
          title: 'Erro na comunicação',
          message: error.message || CHAT_ERRORS.SEND_MESSAGE_FAILED.message,
          suggestion: CHAT_ERRORS.SEND_MESSAGE_FAILED.suggestion,
        };
      }

      // Criar erro formatado
      const formattedError = new Error(errorObj.message);
      formattedError.title = errorObj.title;
      formattedError.suggestion = errorObj.suggestion;

      onError?.(formattedError);
    } finally {
      clearTimeout(timeoutId);
      // Limpa o controller se ainda for o atual
      if (this.currentStreamController === controller) {
        this.currentStreamController = null;
      }
    }
  }

  /**
   * Processa o stream SSE linha por linha
   * @private
   */
  async _processStream(response, onMessage, onComplete) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete?.();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          this._processLine(line, onMessage);
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Processa uma linha SSE individual
   * @private
   */
  _processLine(line, onMessage) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('data: ')) return;

    const payload = trimmed.slice(6).trim();
    if (!payload) return;

    try {
      const rawData = JSON.parse(payload);

      // Adapta o evento SSE do backend para o formato esperado pelo frontend
      const adaptedData = adaptStreamEvent(rawData);

      if (adaptedData) {
        onMessage?.(adaptedData);
      }
    } catch (e) {
      console.error('Erro ao parsear SSE:', e, 'Payload:', payload);
    }
  }

  /**
   * Envia feedback sobre uma mensagem
   * @param {string} sessionId - ID da sessão
   * @param {string} messageId - ID da mensagem
   * @param {string} rating - 'positive', 'negative', 'positivo' ou 'negativo'
   * @param {string|null} comment - Comentário opcional
   * @returns {Promise<{message: string}>}
   */
  async sendFeedback(sessionId, messageId, rating, comment = null) {
    try {
      // Prepara payload usando adaptador (normaliza rating)
      const payload = prepareFeedbackPayload(sessionId, messageId, rating, comment);

      // Backend espera query parameters
      const params = {
        session_id: payload.session_id,
        message_id: payload.message_id,
        rating: payload.rating,
      };

      if (payload.comment) {
        params.comment = payload.comment;
      }

      const response = await apiClient.post('/chat/feedback', null, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Busca histórico de conversas do usuário autenticado
   * @param {string} sessionId - ID da sessão específica (obrigatório)
   * @param {number} limit - Limite de mensagens
   * @returns {Promise<{sessionId: string, messages: Array}>}
   */
  async getChatHistory(sessionId, limit = 100) {
    try {
      if (!sessionId) {
        throw new Error('session_id é obrigatório para buscar histórico');
      }

      const params = {
        session_id: sessionId,
        limit,
      };

      const response = await apiClient.get('/chat/history', { params });

      // Usa adaptador para converter formato backend → frontend
      return adaptChatHistory(response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Busca todas as sessões do usuário autenticado com paginação
   * @param {number} limit - Limite de sessões por página
   * @param {number} offset - Offset para paginação
   * @returns {Promise<{sessions: Array, total: number, limit: number, offset: number, has_more: boolean}>}
   */
  async getUserSessions(limit = 20, offset = 0) {
    try {
      const params = { limit, offset };
      const response = await apiClient.get('/chat/sessions', { params });

      // Backend retorna { sessions: [...], total: N, limit: N, offset: N, has_more: boolean }
      const { sessions = [], total = 0, has_more = false } = response.data;

      return {
        sessions: adaptSessions(sessions),
        total,
        limit,
        offset,
        has_more,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Deleta uma sessão específica
   * @param {string} sessionId - ID da sessão
   * @returns {Promise<{message: string}>}
   */
  async deleteSession(sessionId) {
    try {
      const response = await apiClient.delete(`/chat/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Verifica saúde da API
   * @returns {Promise<{status: string, version: string, timestamp: string, components: Object, system: Object}>}
   */
  async healthCheck() {
    try {
      // Endpoint de health está no router /health, não /chat/health
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Busca configuração de modelos do sistema
   * @returns {Promise<{llm: {provider: string, model: string, temperature: number}, embeddings: {model: string, dimension: number}, rag: {top_k: number, min_similarity: number, reranking_enabled: boolean}}>}
   */
  async getModels() {
    try {
      const response = await apiClient.get('/chat/models');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const chatService = new ChatService();