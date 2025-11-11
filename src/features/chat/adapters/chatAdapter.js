/**
 * Adaptador para converter dados da API backend para formato do frontend
 * Implementa o Adapter Pattern para desacoplar frontend do backend
 *
 * @module chatAdapter
 */

import { BACKEND_ROLES, FRONTEND_MESSAGE_TYPES, validators } from '../types/apiTypes';

/**
 * Converte mensagem do histórico do backend para formato do frontend
 *
 * Backend envia:
 * - role: 'user' | 'assistant'
 * - content: string (para user)
 * - answer: string (para assistant)
 *
 * Frontend espera:
 * - type: 'user' | 'assistant'
 * - content: string (sempre)
 *
 * @param {Object} backendMessage - Mensagem do backend
 * @returns {Object} Mensagem no formato frontend
 */
export const adaptHistoryMessage = (backendMessage) => {
  if (!validators.isValidBackendMessage(backendMessage)) {
    console.warn('Mensagem inválida recebida do backend:', backendMessage);
    return null;
  }

  const {
    message_id,
    role,
    content,
    answer,
    sources = [],
    model_used,
    confidence,
    timestamp,
  } = backendMessage;

  // Determina o conteúdo baseado no role
  const messageContent = role === BACKEND_ROLES.USER ? content : answer;

  // Valida que há conteúdo
  if (!messageContent) {
    console.warn('Mensagem sem conteúdo:', backendMessage);
    return null;
  }

  // Converte timestamp para Date
  let parsedTimestamp;
  try {
    parsedTimestamp = timestamp ? new Date(timestamp) : new Date();
  } catch (error) {
    console.warn('Erro ao parsear timestamp:', timestamp);
    parsedTimestamp = new Date();
  }

  return {
    id: String(message_id || Date.now()),
    type: role === BACKEND_ROLES.USER ? FRONTEND_MESSAGE_TYPES.USER : FRONTEND_MESSAGE_TYPES.ASSISTANT,
    content: messageContent,
    timestamp: parsedTimestamp,
    sources: Array.isArray(sources) ? sources : [],
    modelUsed: model_used || '',
    confidence: typeof confidence === 'number' ? confidence : undefined,
  };
};

/**
 * Converte lista de mensagens do histórico
 * Remove mensagens inválidas automaticamente
 *
 * @param {Array} backendMessages - Array de mensagens do backend
 * @returns {Array} Array de mensagens no formato frontend
 */
export const adaptHistoryMessages = (backendMessages) => {
  if (!Array.isArray(backendMessages)) {
    console.error('adaptHistoryMessages esperava um array, recebeu:', typeof backendMessages);
    return [];
  }

  return backendMessages
    .map(adaptHistoryMessage)
    .filter(message => message !== null);
};

/**
 * Converte resposta completa de histórico do backend
 *
 * @param {Object} backendHistory - { session_id, messages }
 * @returns {Object} { sessionId, messages }
 */
export const adaptChatHistory = (backendHistory) => {
  if (!backendHistory || typeof backendHistory !== 'object') {
    console.error('adaptChatHistory recebeu dados inválidos:', backendHistory);
    return { sessionId: null, messages: [] };
  }

  return {
    sessionId: backendHistory.session_id || null,
    messages: adaptHistoryMessages(backendHistory.messages || []),
  };
};

/**
 * Converte informação de sessão do backend para frontend
 *
 * Backend:
 * - session_id: string
 * - created_at: ISO string
 * - message_count: number
 * - last_message: string (opcional, pode não existir ainda)
 *
 * Frontend:
 * - session_id: string
 * - created_at: Date (validado)
 * - message_count: number
 * - last_message: string (sanitizado)
 *
 * @param {Object} backendSession
 * @returns {Object}
 */
export const adaptSession = (backendSession) => {
  if (!validators.isValidBackendSession(backendSession)) {
    console.warn('Sessão inválida recebida do backend:', backendSession);
    return null;
  }

  const { session_id, created_at, message_count, last_message } = backendSession;

  // Parse e valida data
  let parsedDate;
  try {
    parsedDate = new Date(created_at);
    // Valida se é uma data válida
    if (isNaN(parsedDate.getTime())) {
      console.warn('Data inválida recebida:', created_at);
      parsedDate = new Date();
    }
  } catch (error) {
    console.warn('Erro ao parsear created_at:', created_at, error);
    parsedDate = new Date();
  }

  // Sanitiza last_message (remover excesso de espaços)
  const sanitizedMessage = last_message
    ? last_message.trim().replace(/\s+/g, ' ')
    : 'Nova conversa';

  return {
    session_id,
    created_at: parsedDate,
    message_count: message_count || 0,
    last_message: sanitizedMessage,
  };
};

/**
 * Converte lista de sessões do backend
 *
 * @param {Array} backendSessions
 * @returns {Array}
 */
export const adaptSessions = (backendSessions) => {
  if (!Array.isArray(backendSessions)) {
    console.error('adaptSessions esperava um array, recebeu:', typeof backendSessions);
    return [];
  }

  return backendSessions
    .map(adaptSession)
    .filter(session => session !== null);
};

/**
 * Converte resposta de streaming SSE para formato padronizado
 *
 * @param {Object} sseData - Dados do evento SSE
 * @returns {Object} Dados normalizados
 */
export const adaptStreamEvent = (sseData) => {
  if (!sseData || typeof sseData !== 'object') {
    return null;
  }

  // Já vem no formato correto, apenas normaliza
  return {
    type: sseData.type,
    content: sseData.content,
    sources: sseData.sources,
    confidence: sseData.confidence,
    model_used: sseData.model_used,
    session_id: sseData.session_id,
    message_id: sseData.message_id,
  };
};

/**
 * Prepara payload de feedback para enviar ao backend
 *
 * Frontend pode usar: 'positive', 'negative', 'positivo', 'negativo'
 * Backend espera: 'positivo' ou 'negativo'
 *
 * @param {string} sessionId
 * @param {string|number} messageId
 * @param {string} rating
 * @param {string|null} comment
 * @returns {Object} Payload formatado
 */
export const prepareFeedbackPayload = (sessionId, messageId, rating, comment = null) => {
  // Normaliza rating para o formato esperado pelo backend
  const normalizedRating = normalizeRating(rating);

  if (!normalizedRating) {
    throw new Error(`Rating inválido: ${rating}. Use 'positive', 'negative', 'positivo' ou 'negativo'`);
  }

  const payload = {
    session_id: String(sessionId),
    message_id: String(messageId),
    rating: normalizedRating,
  };

  if (comment && comment.trim()) {
    payload.comment = comment.trim();
  }

  return payload;
};

/**
 * Normaliza rating para formato do backend
 *
 * @param {string} rating
 * @returns {string|null} 'positivo' ou 'negativo', ou null se inválido
 */
const normalizeRating = (rating) => {
  if (!rating || typeof rating !== 'string') {
    return null;
  }

  const normalized = rating.toLowerCase().trim();

  const positiveValues = ['positive', 'positivo', 'upvote', 'thumbs_up', 'good', 'bom'];
  const negativeValues = ['negative', 'negativo', 'downvote', 'thumbs_down', 'bad', 'ruim'];

  if (positiveValues.includes(normalized)) {
    return 'positivo';
  }

  if (negativeValues.includes(normalized)) {
    return 'negativo';
  }

  return null;
};

/**
 * Utilitário para logging de adaptações (apenas em DEV)
 *
 * @param {string} adapterName
 * @param {any} input
 * @param {any} output
 */
export const logAdaptation = (adapterName, input, output) => {
  if (import.meta.env.DEV) {
    console.groupCollapsed(`[Adapter] ${adapterName}`);
    console.log('Input:', input);
    console.log('Output:', output);
    console.groupEnd();
  }
};
