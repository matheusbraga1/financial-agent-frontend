/**
 * Tipos e interfaces para autenticação
 * Sincronizado com backend FastAPI (refactor/app-solid-arch)
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} username - Nome de usuário (3-50 caracteres)
 * @property {string} password - Senha (mínimo 6 caracteres)
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} username - Nome de usuário (3-50 caracteres)
 * @property {string} email - Email válido
 * @property {string} password - Senha (mínimo 8 caracteres)
 */

/**
 * @typedef {Object} RefreshTokenRequest
 * @property {string} refresh_token - JWT refresh token
 */

/**
 * @typedef {Object} TokenResponse
 * @property {string} access_token - JWT access token
 * @property {string} refresh_token - JWT refresh token
 * @property {string} token_type - Tipo do token (geralmente "bearer")
 * @property {number} expires_in - Tempo de expiração em segundos
 */

/**
 * @typedef {Object} UserResponse
 * @property {number} id - ID do usuário
 * @property {string} username - Nome de usuário
 * @property {string} email - Email do usuário
 * @property {boolean} is_active - Se o usuário está ativo
 * @property {boolean} is_admin - Se o usuário é admin
 * @property {string} created_at - Data de criação (ISO 8601)
 */

/**
 * @typedef {Object} MeResponse
 * @property {UserResponse} user - Dados do usuário
 * @property {string} message - Mensagem de sucesso
 */

/**
 * @typedef {Object} LogoutResponse
 * @property {string} message - Mensagem de confirmação
 */

/**
 * Validadores
 */
export const validators = {
  /**
   * Valida username (3-50 caracteres)
   * @param {string} username
   * @returns {boolean}
   */
  isValidUsername(username) {
    return typeof username === 'string' && username.length >= 3 && username.length <= 50;
  },

  /**
   * Valida senha para login (mínimo 6 caracteres)
   * @param {string} password
   * @returns {boolean}
   */
  isValidLoginPassword(password) {
    return typeof password === 'string' && password.length >= 6;
  },

  /**
   * Valida senha para registro (mínimo 8 caracteres)
   * @param {string} password
   * @returns {boolean}
   */
  isValidRegisterPassword(password) {
    return typeof password === 'string' && password.length >= 8;
  },

  /**
   * Valida email
   * @param {string} email
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email);
  },
};
