import {
  getErrorCode,
  getErrorMessage,
  getErrorDetails,
  getErrorTraceId,
  getRetryAfter,
  isRetryableError,
} from '../../types/errorTypes';

/**
 * Classe de erro da API com suporte ao novo ErrorResponse model
 */
export class ApiError extends Error {
  constructor(message, status, data, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = options.code || 'unknown_error';
    this.details = options.details || null;
    this.traceId = options.traceId || null;
    this.retryable = options.retryable || false;
    this.retryAfter = options.retryAfter || null;
  }

  /**
   * Verifica se o erro pode ser tentado novamente
   * @returns {boolean}
   */
  isRetryable() {
    return this.retryable;
  }

  /**
   * Obtém tempo de espera antes de retry (em segundos)
   * @returns {number|null}
   */
  getRetryAfter() {
    return this.retryAfter;
  }

  /**
   * Obtém o trace ID para debugging
   * @returns {string|null}
   */
  getTraceId() {
    return this.traceId;
  }

  /**
   * Converte para objeto JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      traceId: this.traceId,
      retryable: this.retryable,
      retryAfter: this.retryAfter,
    };
  }
}

/**
 * Manipula erros da API e retorna ApiError padronizado
 * Compatível com o novo ErrorResponse model do backend
 * @param {Error} error - Erro capturado do axios
 * @returns {ApiError}
 */
export const handleApiError = (error) => {
  // Se já é ApiError, retorna como está
  if (error instanceof ApiError) {
    return error;
  }

  // Erro de resposta HTTP
  if (error.response) {
    const status = error.response.status;
    const code = getErrorCode(error);
    const message = getErrorMessage(error);
    const details = getErrorDetails(error);
    const traceId = getErrorTraceId(error);
    const retryAfter = getRetryAfter(error);
    const retryable = error.response.data?.retryable ?? isRetryableError(status, code);

    return new ApiError(message, status, error.response.data, {
      code,
      details,
      traceId,
      retryable,
      retryAfter,
    });
  }

  // Erro de rede (sem resposta do servidor)
  if (error.request) {
    return new ApiError(
      'Servidor não está respondendo. Verifique sua conexão.',
      0,
      null,
      {
        code: 'network_error',
        retryable: true,
      }
    );
  }

  // Erro genérico
  return new ApiError(error.message || 'Erro desconhecido', -1, null, {
    code: 'unknown_error',
    retryable: false,
  });
};

/**
 * Formata erro para exibição ao usuário
 * @param {ApiError|Error} error
 * @returns {string}
 */
export const formatErrorForUser = (error) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  return error.message || 'Erro desconhecido';
};

/**
 * Loga erro para debugging (apenas em desenvolvimento)
 * @param {ApiError|Error} error
 * @param {string} context - Contexto onde o erro ocorreu
 */
export const logError = (error, context = '') => {
  if (import.meta.env.DEV) {
    console.group(`[Error] ${context}`);

    if (error instanceof ApiError) {
      console.error('Message:', error.message);
      console.error('Status:', error.status);
      console.error('Code:', error.code);
      console.error('Trace ID:', error.traceId);
      console.error('Retryable:', error.retryable);
      if (error.retryAfter) {
        console.error('Retry After:', error.retryAfter, 'seconds');
      }
      if (error.details) {
        console.error('Details:', error.details);
      }
    } else {
      console.error('Error:', error);
    }

    console.groupEnd();
  }
};
