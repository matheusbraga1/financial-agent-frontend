import api from './axios.config';

/**
 * Serviço de autenticação
 * Integração com endpoints de autenticação do backend
 */
const authService = {
  /**
   * Faz login do usuário
   * @param {string} username - Nome de usuário (ou email)
   * @param {string} password - Senha do usuário
   * @returns {Promise<{access_token: string, refresh_token: string, token_type: string, expires_in: number}>}
   */
  async login(username, password) {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Registra um novo usuário
   * @param {string} username - Nome de usuário (3-50 caracteres)
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário (mínimo 8 caracteres)
   * @returns {Promise<{id: number, username: string, email: string, is_active: boolean, is_admin: boolean, created_at: string}>}
   */
  async register(username, email, password) {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Faz logout do usuário (revoga o refresh token)
   * @param {string} refreshToken - Refresh token para revogar
   * @returns {Promise<{message: string}>}
   */
  async logout(refreshToken) {
    try {
      const response = await api.post('/auth/logout', {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      // Mesmo se falhar, vamos limpar o token localmente
      console.error('Erro ao fazer logout:', error);
      throw this._handleError(error);
    }
  },

  /**
   * Busca informações do usuário atual
   * @returns {Promise<{user: {id: number, username: string, email: string, is_active: boolean, is_admin: boolean, created_at: string}, message: string}>}
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      // Backend retorna { user: {...}, message: "..." }
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Atualiza o access token usando o refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{access_token: string, refresh_token: string, token_type: string, expires_in: number}>}
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken,
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Verifica se existe um access token armazenado
   * @returns {string|null}
   */
  getStoredToken() {
    return localStorage.getItem('auth_token');
  },

  /**
   * Verifica se existe um refresh token armazenado
   * @returns {string|null}
   */
  getStoredRefreshToken() {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Armazena os tokens no localStorage
   * @param {string} accessToken - Access token JWT
   * @param {string} refreshToken - Refresh token JWT
   */
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  },

  /**
   * Armazena apenas o access token no localStorage
   * @param {string} token - Token JWT
   */
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },

  /**
   * Remove os tokens do localStorage
   */
  removeTokens() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Remove apenas o access token do localStorage (compatibilidade)
   */
  removeToken() {
    localStorage.removeItem('auth_token');
  },

  /**
   * Trata erros da API e retorna mensagens amigáveis
   * @private
   */
  _handleError(error) {
    if (error.response) {
      const { status, data } = error.response;

      // Mapeamento de erros comuns
      const errorMessages = {
        400: data?.detail || 'Dados inválidos. Verifique os campos.',
        401: 'Credenciais inválidas. Verifique seu email e senha.',
        403: 'Acesso negado. Você não tem permissão para esta ação.',
        409: 'Este email já está cadastrado.',
        422: 'Dados inválidos. Verifique os campos.',
        500: 'Erro no servidor. Tente novamente mais tarde.',
      };

      const message = errorMessages[status] || data?.detail || 'Erro desconhecido';

      return new Error(message);
    }

    if (error.request) {
      return new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }

    return new Error(error.message || 'Erro inesperado');
  },
};

export default authService;
