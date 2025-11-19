/**
 * Adaptador para estrutura ApiResponse do backend
 *
 * O backend usa ApiResponse[T] em vários endpoints:
 * - POST /auth/register → ApiResponse[UserResponse]
 * - GET /auth/me → ApiResponse[MeResponse]
 * - POST /auth/logout → ApiResponse[Dict[str, str]]
 * - POST /chat/feedback → ApiResponse[Dict[str, str]]
 * - DELETE /chat/sessions/{id} → ApiResponse[Dict[str, str]]
 *
 * Estrutura do backend:
 * {
 *   success: boolean,
 *   data: T,
 *   message: string,
 *   errors?: string[],
 *   meta?: object,
 *   timestamp: string,
 *   request_id?: string
 * }
 *
 * @module apiResponseAdapter
 */

/**
 * Extrai dados de uma ApiResponse
 * @template T
 * @param {Object} apiResponse - Resposta do backend com estrutura ApiResponse
 * @returns {T} - Os dados extraídos
 * @throws {Error} - Se a operação não foi bem-sucedida
 */
export const extractData = (apiResponse) => {
  if (!apiResponse || typeof apiResponse !== 'object') {
    console.error('extractData recebeu resposta inválida:', apiResponse);
    return null;
  }

  // Se a resposta não tem a estrutura ApiResponse, retorna como está
  if (!('success' in apiResponse) || !('data' in apiResponse)) {
    return apiResponse;
  }

  // Se não foi sucesso, lança erro
  if (!apiResponse.success) {
    const errorMessage = apiResponse.message || 'Erro na operação';
    const error = new Error(errorMessage);
    error.errors = apiResponse.errors || [];
    error.statusCode = apiResponse.statusCode;
    throw error;
  }

  return apiResponse.data;
};

/**
 * Verifica se uma resposta é do tipo ApiResponse
 * @param {Object} response
 * @returns {boolean}
 */
export const isApiResponse = (response) => {
  return (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    'data' in response &&
    'message' in response
  );
};

/**
 * Extrai mensagem de uma ApiResponse (útil para toasts)
 * @param {Object} apiResponse
 * @returns {string}
 */
export const extractMessage = (apiResponse) => {
  if (!apiResponse || typeof apiResponse !== 'object') {
    return '';
  }

  return apiResponse.message || '';
};

/**
 * Extrai dados e mensagem de uma ApiResponse
 * @template T
 * @param {Object} apiResponse
 * @returns {{data: T, message: string}}
 */
export const extractDataWithMessage = (apiResponse) => {
  return {
    data: extractData(apiResponse),
    message: extractMessage(apiResponse),
  };
};

/**
 * Cria uma ApiResponse de sucesso (útil para mocks/testes)
 * @template T
 * @param {T} data - Dados da resposta
 * @param {string} message - Mensagem de sucesso
 * @returns {Object}
 */
export const createSuccessResponse = (data, message = 'Operação realizada com sucesso') => {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Cria uma ApiResponse de erro (útil para mocks/testes)
 * @param {string} message - Mensagem de erro
 * @param {string[]} errors - Lista de erros
 * @returns {Object}
 */
export const createErrorResponse = (message, errors = []) => {
  return {
    success: false,
    data: null,
    message,
    errors,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Wrapper seguro para extrair dados que pode retornar null ao invés de lançar erro
 * @template T
 * @param {Object} apiResponse
 * @returns {T|null}
 */
export const safeExtractData = (apiResponse) => {
  try {
    return extractData(apiResponse);
  } catch (error) {
    console.error('Erro ao extrair dados:', error);
    return null;
  }
};
