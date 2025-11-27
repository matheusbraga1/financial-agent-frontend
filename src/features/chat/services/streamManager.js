import { config } from '../../../config/env';
import { STREAM_TIMEOUT } from '../../../constants/apiConstants';
import { CHAT_ERRORS, NETWORK_ERRORS } from '../../../constants/errorMessages';
import { adaptStreamEvent } from '../adapters/chatAdapter';

/**
 * StreamManager - Gerenciador Global de Streams
 *
 * Singleton que mantém streams ativos mesmo quando componentes são desmontados.
 * Permite reconexão a streams em andamento ao retornar para uma conversa.
 *
 * Padrão inspirado no ChatGPT/Claude:
 * - Streams continuam em background quando usuário navega
 * - Tokens são acumulados e disponibilizados ao reconectar
 * - Cancelamento apenas por ação explícita do usuário
 */
class StreamManager {
  constructor() {
    // Map de streams ativos: sessionId -> StreamState
    this.activeStreams = new Map();

    // Listeners globais para notificar mudanças de estado
    this.listeners = new Set();
  }

  /**
   * Estado inicial de um stream
   * @private
   */
  _createStreamState() {
    return {
      isStreaming: false,
      isLoading: false,
      content: '',
      sources: [],
      confidence: null,
      modelUsed: '',
      error: null,
      controller: null,
      timeoutId: null,
      messageId: null,
      backendSessionId: null,
    };
  }

  /**
   * Obtém estado do stream de uma sessão
   * @param {string} sessionId
   * @returns {Object|null}
   */
  getStreamState(sessionId) {
    return this.activeStreams.get(sessionId) || null;
  }

  /**
   * Verifica se há stream ativo para uma sessão
   * @param {string} sessionId
   * @returns {boolean}
   */
  hasActiveStream(sessionId) {
    const state = this.activeStreams.get(sessionId);
    return state?.isStreaming || state?.isLoading || false;
  }

  /**
   * Registra listener para mudanças de estado
   * @param {Function} listener
   * @returns {Function} Função para cancelar registro
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifica todos os listeners sobre mudança de estado
   * @private
   */
  _notifyListeners(sessionId, state) {
    this.listeners.forEach(listener => {
      try {
        listener(sessionId, state);
      } catch (e) {
        console.error('[StreamManager] Erro no listener:', e);
      }
    });
  }

  /**
   * Atualiza estado de um stream e notifica listeners
   * @private
   */
  _updateStreamState(sessionId, updates) {
    const current = this.activeStreams.get(sessionId) || this._createStreamState();
    const newState = { ...current, ...updates };
    this.activeStreams.set(sessionId, newState);
    this._notifyListeners(sessionId, newState);
    return newState;
  }

  /**
   * Inicia um novo stream
   * @param {string} question - Pergunta do usuário
   * @param {string} sessionId - ID da sessão
   * @param {string} messageId - ID da mensagem do assistente
   * @returns {Promise<{backendSessionId: string|null}>}
   */
  async startStream(question, sessionId, messageId) {
    const url = `${config.apiUrl}/chat/stream`;

    // Cancela stream anterior da mesma sessão se existir
    const existingState = this.activeStreams.get(sessionId);
    if (existingState) {
      if (existingState.controller) {
        existingState.controller.abort();
      }
      if (existingState.timeoutId) {
        clearTimeout(existingState.timeoutId);
      }
    }

    // Cria novo estado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STREAM_TIMEOUT);

    this._updateStreamState(sessionId, {
      isLoading: true,
      isStreaming: false,
      content: '',
      sources: [],
      confidence: null,
      modelUsed: '',
      error: null,
      controller,
      timeoutId,
      messageId,
      backendSessionId: null,
    });

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

      await this._processStream(response, sessionId);

      const finalState = this.activeStreams.get(sessionId);
      const backendSessionId = finalState?.backendSessionId || null;
      console.debug('[StreamManager] Stream finalizado, retornando sessionId:', backendSessionId);
      return { backendSessionId };
    } catch (error) {
      return this._handleStreamError(sessionId, error, controller);
    } finally {
      clearTimeout(timeoutId);
      const state = this.activeStreams.get(sessionId);
      if (state?.controller === controller) {
        this._updateStreamState(sessionId, {
          controller: null,
          timeoutId: null,
        });
      }
    }
  }

  /**
   * Processa o stream SSE
   * @private
   */
  async _processStream(response, sessionId) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          this._updateStreamState(sessionId, {
            isStreaming: false,
            isLoading: false,
          });
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          this._processLine(line, sessionId);
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
  _processLine(line, sessionId) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('data: ')) return;

    const payload = trimmed.slice(6).trim();
    if (!payload) return;

    try {
      const rawData = JSON.parse(payload);
      const data = adaptStreamEvent(rawData);

      if (!data) return;

      const state = this.activeStreams.get(sessionId);
      if (!state) return;

      switch (data.type) {
        case 'start':
          // Marca o início do streaming
          // Salva session_id do backend se fornecido
          if (data.session_id) {
            this._updateStreamState(sessionId, {
              backendSessionId: data.session_id
            });
          }
          // Mantém isLoading=true, isStreaming=false até primeiro token
          break;

        case 'sources':
          this._updateStreamState(sessionId, {
            sources: data.sources || []
          });
          break;

        case 'confidence':
          if (typeof data.confidence === 'number') {
            this._updateStreamState(sessionId, {
              confidence: data.confidence
            });
          }
          break;

        case 'token': {
          const isFirstToken = !state.content;
          const newContent = state.content + (data.content ?? '');

          const updates = { content: newContent };

          if (isFirstToken) {
            updates.isLoading = false;
            updates.isStreaming = true;
          }

          this._updateStreamState(sessionId, updates);
          break;
        }

        case 'metadata':
          const metaUpdates = { modelUsed: data.model_used };
          if (data.session_id) {
            metaUpdates.backendSessionId = data.session_id;
          }
          if (typeof data.confidence === 'number') {
            metaUpdates.confidence = data.confidence;
          }
          this._updateStreamState(sessionId, metaUpdates);
          break;

        case 'done':
          this._updateStreamState(sessionId, {
            isStreaming: false,
            isLoading: false,
          });
          break;
      }
    } catch (e) {
      console.error('[StreamManager] Erro ao parsear SSE:', e, 'Payload:', payload);
    }
  }

  /**
   * Trata erros do stream
   * @private
   */
  _handleStreamError(sessionId, error, controller) {
    // Se foi abortado manualmente pelo usuário
    if (error.name === 'AbortError') {
      this._updateStreamState(sessionId, {
        isStreaming: false,
        isLoading: false,
      });
      return { backendSessionId: null };
    }

    let errorObj;

    if (error.name === 'AbortError') {
      errorObj = NETWORK_ERRORS.TIMEOUT;
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorObj = NETWORK_ERRORS.NO_CONNECTION;
    } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      errorObj = NETWORK_ERRORS.SERVER_ERROR;
    } else if (error.message.includes('429')) {
      errorObj = NETWORK_ERRORS.RATE_LIMIT;
    } else if (error.message.includes('stream') || error.message.includes('connection')) {
      errorObj = CHAT_ERRORS.STREAM_CONNECTION_FAILED;
    } else {
      errorObj = {
        title: 'Erro na comunicação',
        message: error.message || CHAT_ERRORS.SEND_MESSAGE_FAILED.message,
        suggestion: CHAT_ERRORS.SEND_MESSAGE_FAILED.suggestion,
      };
    }

    const formattedError = new Error(errorObj.message);
    formattedError.title = errorObj.title;
    formattedError.suggestion = errorObj.suggestion;

    this._updateStreamState(sessionId, {
      isStreaming: false,
      isLoading: false,
      error: formattedError,
    });

    return { backendSessionId: null };
  }

  /**
   * Cancela o stream de uma sessão específica
   * @param {string} sessionId
   */
  cancelStream(sessionId) {
    const state = this.activeStreams.get(sessionId);
    if (!state) return;

    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    if (state.controller) {
      state.controller.abort();
    }

    this._updateStreamState(sessionId, {
      isStreaming: false,
      isLoading: false,
      controller: null,
      timeoutId: null,
    });
  }

  /**
   * Limpa o estado de uma sessão (após navegar para nova conversa)
   * @param {string} sessionId
   */
  clearSession(sessionId) {
    const state = this.activeStreams.get(sessionId);

    // Não cancela o stream, apenas remove referências locais
    // O stream continua rodando em background
    if (state && !state.isStreaming && !state.isLoading) {
      this.activeStreams.delete(sessionId);
      this._notifyListeners(sessionId, null);
    }
  }

  /**
   * Limpa todos os streams (logout, etc)
   */
  clearAll() {
    for (const [sessionId, state] of this.activeStreams) {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }
      if (state.controller) {
        state.controller.abort();
      }
    }

    this.activeStreams.clear();
    this._notifyListeners(null, null);
  }
}

// Singleton instance
export const streamManager = new StreamManager();
