/**
 * Tipos e interfaces para comunicação com a API
 * Centraliza definições de tipos para garantir consistência
 */

/**
 * @typedef {Object} BackendChatMessage
 * @property {number} message_id - ID da mensagem
 * @property {string} role - 'user' ou 'assistant'
 * @property {string} [content] - Conteúdo da mensagem do usuário
 * @property {string} [answer] - Resposta do assistente
 * @property {Array<SourceDocument>} [sources] - Fontes da resposta
 * @property {string} [model_used] - Modelo LLM utilizado
 * @property {number} [confidence] - Confiança da resposta (0-1)
 * @property {string} timestamp - ISO 8601 timestamp
 */

/**
 * @typedef {Object} BackendChatHistory
 * @property {string} session_id - ID da sessão
 * @property {Array<BackendChatMessage>} messages - Lista de mensagens
 */

/**
 * @typedef {Object} BackendSession
 * @property {string} session_id - ID da sessão
 * @property {string} created_at - ISO 8601 timestamp
 * @property {number} message_count - Quantidade de mensagens
 * @property {string} last_message - Última mensagem da conversa
 * @property {string} [user_id] - ID do usuário (opcional)
 */

/**
 * @typedef {Object} SourceDocument
 * @property {string} id - ID do documento
 * @property {string} title - Título do documento
 * @property {string} category - Categoria
 * @property {number} score - Score de relevância (0-1)
 * @property {string} [snippet] - Trecho relevante
 */

/**
 * @typedef {Object} FrontendMessage
 * @property {string} id - ID único da mensagem
 * @property {'user'|'assistant'} type - Tipo da mensagem
 * @property {string} content - Conteúdo da mensagem
 * @property {Date} timestamp - Data/hora
 * @property {Array<SourceDocument>} [sources] - Fontes (apenas assistant)
 * @property {string} [modelUsed] - Modelo usado (apenas assistant)
 * @property {number} [confidence] - Confiança (apenas assistant)
 */

/**
 * @typedef {Object} FeedbackPayload
 * @property {string} session_id - ID da sessão
 * @property {string} message_id - ID da mensagem
 * @property {'positivo'|'negativo'} rating - Avaliação
 * @property {string} [comment] - Comentário opcional
 */

/**
 * Tipos de rating aceitos pelo backend
 */
export const RATING_TYPES = {
  POSITIVE: 'positivo',
  NEGATIVE: 'negativo',
};

/**
 * Tipos de role do backend
 */
export const BACKEND_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
};

/**
 * Tipos de mensagem do frontend
 */
export const FRONTEND_MESSAGE_TYPES = {
  USER: 'user',
  ASSISTANT: 'assistant',
};

/**
 * Validação de tipos em runtime
 */
export const validators = {
  /**
   * Valida se é um rating válido
   * @param {string} rating
   * @returns {boolean}
   */
  isValidRating(rating) {
    return Object.values(RATING_TYPES).includes(rating);
  },

  /**
   * Valida se é um role válido do backend
   * @param {string} role
   * @returns {boolean}
   */
  isValidBackendRole(role) {
    return Object.values(BACKEND_ROLES).includes(role);
  },

  /**
   * Valida estrutura de mensagem do backend
   * @param {any} msg
   * @returns {boolean}
   */
  isValidBackendMessage(msg) {
    return (
      msg &&
      typeof msg === 'object' &&
      typeof msg.message_id !== 'undefined' &&
      typeof msg.role === 'string' &&
      typeof msg.timestamp === 'string' &&
      this.isValidBackendRole(msg.role)
    );
  },

  /**
   * Valida estrutura de sessão do backend
   * @param {any} session
   * @returns {boolean}
   */
  isValidBackendSession(session) {
    return (
      session &&
      typeof session === 'object' &&
      typeof session.session_id === 'string' &&
      typeof session.created_at === 'string' &&
      typeof session.message_count === 'number' &&
      typeof session.last_message === 'string'
    );
  },
};
