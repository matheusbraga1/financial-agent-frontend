import { apiClient } from '../../../services/api/axios.config';
import { config } from '../../../config/env';
import { handleApiError } from '../../../utils';
import { STREAM_TIMEOUT } from '../../../constants/apiConstants';

class ChatService {
  async sendMessage(question, sessionId = null) {
    try {
      const response = await apiClient.post('/chat/chat', {
        question,
        sessionId
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async sendMessageStream(question, sessionId, onMessage, onError, onComplete) {
    const url = `${config.apiUrl}/chat/chat/stream`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ question, sessionId }),
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
      
      // NOVO: Mensagens de erro mais amigáveis
      let friendlyMessage = 'Erro ao conectar com o servidor';
      
      if (error.name === 'AbortError') {
        friendlyMessage = 'Tempo limite excedido. Tente novamente.';
      } else if (error.message.includes('Failed to fetch')) {
        friendlyMessage = 'Sem conexão com o servidor. Verifique sua internet.';
      } else if (error.message.includes('500')) {
        friendlyMessage = 'Erro interno do servidor. Nossa equipe foi notificada.';
      } else if (error.message.includes('429')) {
        friendlyMessage = 'Muitas requisições. Aguarde alguns segundos.';
      }
      
      onError?.(new Error(friendlyMessage));
    } finally {
      clearTimeout(timeoutId);
      controller.abort();
    }
  }

  async _processStream(response, onMessage, onComplete) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

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

    reader.releaseLock();
  }

  _processLine(line, onMessage) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('data: ')) return;

    const payload = trimmed.slice(6).trim();
    if (!payload) return;

    try {
      const data = JSON.parse(payload);
      onMessage?.(data);
    } catch (e) {
      console.error('Erro ao parsear SSE:', e);
    }
  }

  async sendFeedback(sessionId, messageId, rating, comment = null) {
    try {
      const response = await apiClient.post('/chat/feedback', null, {
        params: { session_id: sessionId, message_id: messageId, rating, comment },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async healthCheck() {
    try {
      const response = await apiClient.get('/chat/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const chatService = new ChatService();