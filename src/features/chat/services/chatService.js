import { apiClient } from '../../../services/api/axios.config';
import { config } from '../../../config/env';
import { handleApiError } from '../../../utils';
import { STREAM_TIMEOUT } from '../../../constants/apiConstants';
import {
  adaptChatHistory,
  adaptSessions,
  adaptStreamEvent,
  prepareFeedbackPayload,
} from '../adapters/chatAdapter';

/**
 * Serviço de Chat - Comunicação com a API de Chat
 * Sincronizado com backend FastAPI
 */
class ChatService {
  /**
   * Envia mensagem e recebe resposta completa (sem streaming)
   * @param {string} question - Pergunta do usuário
   * @param {string|null} sessionId - ID da sessão (opcional)
   * @returns {Promise<{answer: string, sources: Array, model_used: string, session_id: string}>}
   */
  async sendMessage(question, sessionId = null) {
    try {
      const response = await apiClient.post('/chat', {
        question,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
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
    const controller = new AbortController();
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
      
      let friendlyMessage = 'Erro ao conectar com o servidor';
      
      if (error.name === 'AbortError') {
        friendlyMessage = 'Tempo limite excedido. Tente novamente.';
      } else if (error.message.includes('Failed to fetch')) {
        friendlyMessage = 'Sem conexão com o servidor. Verifique sua internet.';
      } else if (error.message.includes('500')) {
        friendlyMessage = 'Erro interno do servidor. Nossa equipe foi notificada.';
      } else if (error.message.includes('429')) {
        friendlyMessage = 'Muitas requisições. Aguarde alguns segundos.';
      } else if (error.message) {
        friendlyMessage = error.message;
      }
      
      onError?.(new Error(friendlyMessage));
    } finally {
      clearTimeout(timeoutId);
      controller.abort();
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
      const data = JSON.parse(payload);
      onMessage?.(data);
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
   * @returns {Promise<{status: string, timestamp: string}>}
   */
  async healthCheck() {
    try {
      const response = await apiClient.get('/chat/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Busca informações sobre modelos disponíveis
   * @returns {Promise<{models: Array<string>, default: string}>}
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