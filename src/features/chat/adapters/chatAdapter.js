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
    persisted,
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
  } catch {
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
    persisted: typeof persisted === 'boolean' ? persisted : false,
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
 * Backend envia eventos no formato:
 * - Token: { type: 'token', data: 'texto' }
 * - Sources: { type: 'sources', data: [...] }
 * - Confidence: { type: 'confidence', data: 0.95 }
 * - Metadata: { type: 'metadata', data: { session_id, message_id, ... } }
 * - Done: { type: 'done' }
 *
 * Frontend espera:
 * - Token: { type: 'token', content: 'texto' }
 * - Sources: { type: 'sources', sources: [...] }
 * - Confidence: { type: 'confidence', confidence: 0.95 }
 * - Metadata: { type: 'metadata', session_id, message_id, ... }
 * - Done: { type: 'done' }
 *
 * @param {Object} sseData - Dados do evento SSE do backend
 * @returns {Object} Dados normalizados para o frontend
 */
export const adaptStreamEvent = (sseData) => {
  if (!sseData || typeof sseData !== 'object' || !sseData.type) {
    return null;
  }

  const { type, data } = sseData;

  // Evento 'start' - sinaliza início do streaming (enviado pelo backend)
  if (type === 'start') {
    return { type: 'start' };
  }

  // Evento 'done' não tem dados adicionais
  if (type === 'done') {
    return { type: 'done' };
  }

  // Evento 'error' - repassa a mensagem de erro
  if (type === 'error') {
    return {
      type: 'error',
      message: data?.message || 'Erro desconhecido',
    };
  }

  // Evento 'token' - converte 'data' para 'content'
  if (type === 'token') {
    return {
      type: 'token',
      content: typeof data === 'string' ? data : '',
    };
  }

  // Evento 'sources' - converte 'data' para 'sources'
  if (type === 'sources') {
    return {
      type: 'sources',
      sources: Array.isArray(data) ? data : [],
    };
  }

  // Evento 'confidence' - converte 'data' para 'confidence'
  if (type === 'confidence') {
    return {
      type: 'confidence',
      confidence: typeof data === 'number' ? data : null,
    };
  }

  // Evento 'metadata' - espalha os dados do objeto data diretamente
  if (type === 'metadata') {
    if (typeof data !== 'object') {
      return null;
    }

    return {
      type: 'metadata',
      session_id: data.session_id,
      message_id: data.message_id,
      model_used: data.model_used,
      confidence: data.confidence,
      persisted: data.persisted,
      timestamp: data.timestamp,
    };
  }

  // Tipo desconhecido - retorna como está
  console.warn('Tipo de evento SSE desconhecido:', type);
  return { type, data };
};

/**
 * Prepara payload de feedback para enviar ao backend
 *
 * Frontend pode usar: 'positive', 'negative', 'neutral' (e variantes em português)
 * Backend espera: 'positive', 'negative' ou 'neutral'
 *
 * @param {string} sessionId - ID da sessão
 * @param {string|number} messageId - ID da mensagem
 * @param {string} rating - 'positive', 'negative', 'neutral' ou variantes
 * @param {string|null} comment - Comentário opcional
 * @returns {Object} Payload formatado para a API
 */
export const prepareFeedbackPayload = (sessionId, messageId, rating, comment = null) => {
  // Normaliza rating para o formato esperado pelo backend
  const normalizedRating = normalizeRating(rating);

  if (!normalizedRating) {
    throw new Error(`Rating inválido: ${rating}. Use 'positive', 'negative' ou 'neutral'`);
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
 * Normaliza rating para formato aceito pelo backend
 *
 * Backend aceita: positive, positivo, negative, negativo, neutral
 * @see manage_conversation_use_case._is_helpful_rating()
 *
 * @param {string} rating - Rating em qualquer formato aceito
 * @returns {string|null} Rating normalizado ou null se inválido
 */
const normalizeRating = (rating) => {
  if (!rating || typeof rating !== 'string') {
    return null;
  }

  const normalized = rating.toLowerCase().trim();

  // Mapeamento para valores aceitos pelo backend
  const positiveValues = ['positive', 'positivo', 'upvote', 'thumbs_up', 'good', 'bom', 'helpful', 'like'];
  const negativeValues = ['negative', 'negativo', 'downvote', 'thumbs_down', 'bad', 'ruim', 'unhelpful', 'dislike'];
  const neutralValues = ['neutral', 'neutro', 'ok', 'meh'];

  if (positiveValues.includes(normalized)) {
    return 'positive'; // Formato padrão conforme documentação da API
  }

  if (negativeValues.includes(normalized)) {
    return 'negative'; // Formato padrão conforme documentação da API
  }

  if (neutralValues.includes(normalized)) {
    return 'neutral'; // Formato padrão conforme documentação da API
  }

  return null;
};

/**
 * Adapta resposta completa (não-streaming) do backend
 *
 * Backend retorna:
 * - answer: string (conteúdo da resposta)
 * - sources: Array
 * - confidence: number
 * - model_used: string
 * - session_id: string
 * - persisted: boolean
 * - message_id: string (opcional)
 *
 * Frontend espera:
 * - content: string (não "answer")
 * - sources, confidence, modelUsed (camelCase)
 *
 * @param {Object} backendResponse - Resposta do endpoint POST /chat
 * @returns {Object} Resposta adaptada para o frontend
 */
export const adaptChatResponse = (backendResponse) => {
  if (!backendResponse || typeof backendResponse !== 'object') {
    console.error('adaptChatResponse recebeu dados inválidos:', backendResponse);
    return {
      content: '',
      sources: [],
      modelUsed: '',
      sessionId: null,
    };
  }

  return {
    content: backendResponse.answer || '',
    sources: Array.isArray(backendResponse.sources) ? backendResponse.sources : [],
    confidence: typeof backendResponse.confidence === 'number' ? backendResponse.confidence : undefined,
    modelUsed: backendResponse.model_used || '',
    sessionId: backendResponse.session_id || null,
    messageId: backendResponse.message_id || null,
    persisted: backendResponse.persisted || false,
  };
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
