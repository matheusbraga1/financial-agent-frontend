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
 * @returns {Object|null} Mensagem no formato frontend ou null se inválida
 */
export const adaptHistoryMessage = (backendMessage) => {
  // Validação básica
  if (!backendMessage || typeof backendMessage !== 'object') {
    console.warn('adaptHistoryMessage: mensagem inválida', backendMessage);
    return null;
  }

  // Validação de estrutura (mais flexível)
  if (!backendMessage.role || !validators.isValidBackendRole(backendMessage.role)) {
    console.warn('adaptHistoryMessage: role inválido', backendMessage);
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
  if (!messageContent && messageContent !== '') {
    console.warn('adaptHistoryMessage: mensagem sem conteúdo', backendMessage);
    return null;
  }

  // Converte timestamp para Date com fallback seguro
  let parsedTimestamp;
  try {
    parsedTimestamp = timestamp ? new Date(timestamp) : new Date();
    if (isNaN(parsedTimestamp.getTime())) {
      parsedTimestamp = new Date();
    }
  } catch {
    parsedTimestamp = new Date();
  }

  return {
    id: String(message_id ?? `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
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
    console.error('adaptHistoryMessages: esperava array, recebeu:', typeof backendMessages);
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
    console.error('adaptChatHistory: dados inválidos', backendHistory);
    return { sessionId: null, messages: [] };
  }

  return {
    sessionId: backendHistory.session_id || null,
    messages: adaptHistoryMessages(backendHistory.messages || []),
  };
};

/**
 * Converte informação de sessão do backend para frontend
 * CORRIGIDO: Aceita last_message como null/undefined
 *
 * @param {Object} backendSession
 * @returns {Object|null}
 */
export const adaptSession = (backendSession) => {
  // Validação básica
  if (!backendSession || typeof backendSession !== 'object') {
    console.warn('adaptSession: sessão inválida', backendSession);
    return null;
  }

  // Validação de campos obrigatórios (session_id e created_at)
  if (!backendSession.session_id || typeof backendSession.session_id !== 'string') {
    console.warn('adaptSession: session_id inválido', backendSession);
    return null;
  }

  const { session_id, created_at, message_count, last_message } = backendSession;

  // Parse e valida data
  let parsedDate;
  try {
    parsedDate = created_at ? new Date(created_at) : new Date();
    if (isNaN(parsedDate.getTime())) {
      parsedDate = new Date();
    }
  } catch {
    parsedDate = new Date();
  }

  // Sanitiza last_message (permite null/undefined)
  const sanitizedMessage = last_message
    ? String(last_message).trim().replace(/\s+/g, ' ')
    : 'Nova conversa';

  return {
    session_id,
    created_at: parsedDate,
    message_count: typeof message_count === 'number' ? message_count : 0,
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
    console.error('adaptSessions: esperava array, recebeu:', typeof backendSessions);
    return [];
  }

  return backendSessions
    .map(adaptSession)
    .filter(session => session !== null);
};

/**
 * Converte resposta de streaming SSE para formato padronizado
 *
 * @param {Object} sseData - Dados do evento SSE do backend
 * @returns {Object|null} Dados normalizados para o frontend
 */
export const adaptStreamEvent = (sseData) => {
  if (!sseData || typeof sseData !== 'object' || !sseData.type) {
    return null;
  }

  const { type, data } = sseData;

  switch (type) {
    case 'done':
      return { type: 'done' };

    case 'error':
      return {
        type: 'error',
        message: data?.message || 'Erro desconhecido',
      };

    case 'token':
      return {
        type: 'token',
        content: typeof data === 'string' ? data : '',
      };

    case 'sources':
      return {
        type: 'sources',
        sources: Array.isArray(data) ? data : [],
      };

    case 'confidence':
      return {
        type: 'confidence',
        confidence: typeof data === 'number' ? data : null,
      };

    case 'start':
      return {
        type: 'start',
        session_id: data?.session_id || null,
        model_used: data?.model_used || '',
        timestamp: data?.timestamp || new Date().toISOString(),
      };

    case 'metadata':
      if (typeof data !== 'object') return null;
      return {
        type: 'metadata',
        session_id: data.session_id,
        message_id: data.message_id,
        model_used: data.model_used,
        confidence: data.confidence,
        persisted: data.persisted,
        timestamp: data.timestamp,
      };

    default:
      console.warn('Tipo de evento SSE desconhecido:', type, 'Data:', data);
      return null;  // Retorna null para ser ignorado em streamManager
  }
};

/**
 * Adapta resposta completa (não-streaming) do backend
 *
 * @param {Object} backendResponse - Resposta do endpoint POST /chat
 * @returns {Object} Resposta adaptada para o frontend
 */
export const adaptChatResponse = (backendResponse) => {
  if (!backendResponse || typeof backendResponse !== 'object') {
    console.error('adaptChatResponse: dados inválidos', backendResponse);
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
 */
export const logAdaptation = (adapterName, input, output) => {
  if (import.meta.env?.DEV) {
    console.groupCollapsed(`[Adapter] ${adapterName}`);
    console.log('Input:', input);
    console.log('Output:', output);
    console.groupEnd();
  }
};