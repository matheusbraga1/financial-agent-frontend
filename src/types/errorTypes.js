/**
 * Tipos e interfaces para tratamento de erros
 * Sincronizado com backend FastAPI ErrorResponse model
 */

/**
 * @typedef {Object} ErrorResponse
 * @property {string} code - Código do erro (ex: "validation_error", "rate_limited")
 * @property {string} message - Mensagem amigável para o usuário
 * @property {string} [trace_id] - ID de rastreamento (X-Request-ID)
 * @property {Object} [details] - Detalhes adicionais do erro
 * @property {boolean} [retryable] - Se o erro pode ser tentado novamente
 * @property {number} [retry_after] - Segundos para aguardar antes de retry
 */

/**
 * Códigos de erro padronizados
 */
export const ERROR_CODES = {
  // Validação
  VALIDATION_ERROR: 'validation_error',
  INVALID_INPUT: 'invalid_input',

  // Autenticação
  UNAUTHORIZED: 'unauthorized',
  INVALID_CREDENTIALS: 'invalid_credentials',
  TOKEN_EXPIRED: 'token_expired',
  TOKEN_INVALID: 'token_invalid',

  // Autorização
  FORBIDDEN: 'forbidden',
  INSUFFICIENT_PERMISSIONS: 'insufficient_permissions',

  // Rate limiting
  RATE_LIMITED: 'rate_limited',
  TOO_MANY_REQUESTS: 'too_many_requests',

  // Recursos
  NOT_FOUND: 'not_found',
  RESOURCE_NOT_FOUND: 'resource_not_found',
  ALREADY_EXISTS: 'already_exists',

  // Servidor
  INTERNAL_ERROR: 'internal_error',
  SERVICE_UNAVAILABLE: 'service_unavailable',
  TIMEOUT: 'timeout',

  // Rede
  NETWORK_ERROR: 'network_error',
  CONNECTION_ERROR: 'connection_error',
};

/**
 * Mensagens de erro padrão por código HTTP
 */
export const HTTP_ERROR_MESSAGES = {
  400: 'Dados inválidos. Verifique os campos.',
  401: 'Credenciais inválidas. Faça login novamente.',
  403: 'Acesso negado. Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
  409: 'Este recurso já existe.',
  422: 'Dados inválidos. Verifique os campos.',
  429: 'Muitas requisições. Aguarde alguns segundos.',
  500: 'Erro no servidor. Tente novamente mais tarde.',
  502: 'Servidor temporariamente indisponível.',
  503: 'Serviço temporariamente indisponível.',
  504: 'Tempo limite excedido. Tente novamente.',
};

/**
 * Determina se um erro é retentável
 * @param {number} status - Código de status HTTP
 * @param {string} code - Código do erro
 * @returns {boolean}
 */
export const isRetryableError = (status, code) => {
  // Erros de rede são sempre retentáveis
  if (code === ERROR_CODES.NETWORK_ERROR || code === ERROR_CODES.CONNECTION_ERROR) {
    return true;
  }

  // Erros 5xx são retentáveis
  if (status >= 500 && status < 600) {
    return true;
  }

  // Rate limiting é retentável
  if (status === 429 || code === ERROR_CODES.RATE_LIMITED) {
    return true;
  }

  // Timeout é retentável
  if (code === ERROR_CODES.TIMEOUT) {
    return true;
  }

  return false;
};

/**
 * Extrai o código de erro do erro da API
 * @param {Object} error - Objeto de erro
 * @returns {string}
 */
export const getErrorCode = (error) => {
  if (error.response?.data?.code) {
    return error.response.data.code;
  }

  const status = error.response?.status;

  if (status === 401) return ERROR_CODES.UNAUTHORIZED;
  if (status === 403) return ERROR_CODES.FORBIDDEN;
  if (status === 404) return ERROR_CODES.NOT_FOUND;
  if (status === 409) return ERROR_CODES.ALREADY_EXISTS;
  if (status === 429) return ERROR_CODES.RATE_LIMITED;
  if (status >= 500) return ERROR_CODES.INTERNAL_ERROR;

  if (error.request && !error.response) {
    return ERROR_CODES.NETWORK_ERROR;
  }

  return ERROR_CODES.INTERNAL_ERROR;
};

/**
 * Extrai a mensagem de erro
 * @param {Object} error - Objeto de erro
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  // Mensagem do novo formato ErrorResponse
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Fallback para formato antigo (detail)
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  // Mensagem padrão baseada no status
  const status = error.response?.status;
  if (status && HTTP_ERROR_MESSAGES[status]) {
    return HTTP_ERROR_MESSAGES[status];
  }

  // Erro de rede
  if (error.request && !error.response) {
    return 'Não foi possível conectar ao servidor. Verifique sua conexão.';
  }

  // Mensagem genérica do erro
  return error.message || 'Erro desconhecido';
};

/**
 * Extrai detalhes adicionais do erro
 * @param {Object} error - Objeto de erro
 * @returns {Object|null}
 */
export const getErrorDetails = (error) => {
  return error.response?.data?.details || null;
};

/**
 * Extrai o trace ID do erro
 * @param {Object} error - Objeto de erro
 * @returns {string|null}
 */
export const getErrorTraceId = (error) => {
  return error.response?.data?.trace_id || error.response?.headers?.['x-request-id'] || null;
};

/**
 * Extrai o tempo de retry do erro
 * @param {Object} error - Objeto de erro
 * @returns {number|null}
 */
export const getRetryAfter = (error) => {
  // Do ErrorResponse body
  if (error.response?.data?.retry_after) {
    return error.response.data.retry_after;
  }

  // Do header Retry-After
  const retryAfterHeader = error.response?.headers?.['retry-after'];
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    return isNaN(seconds) ? null : seconds;
  }

  return null;
};
