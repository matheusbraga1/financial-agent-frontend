import api from './axios.config';

/**
 * Serviço de autenticação
 * Integração com endpoints de autenticação do backend
 */
const authService = {
  /**
   * Faz login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @returns {Promise<{access_token: string, token_type: string, expires_in: number}>}
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Registra um novo usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {string} name - Nome do usuário (opcional)
   * @returns {Promise<{id: number, email: string, name: string, is_active: boolean}>}
   */
  async register(email, password, name) {
    try {
      const response = await api.post('/auth/register', {
        email,
        password,
        name,
      });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Faz logout do usuário (revoga o token)
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Mesmo se falhar, vamos limpar o token localmente
      console.error('Erro ao fazer logout:', error);
    }
  },

  /**
   * Busca informações do usuário atual
   * @returns {Promise<{id: number, email: string, name: string, is_active: boolean, is_admin: boolean}>}
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Verifica se existe um token armazenado
   * @returns {string|null}
   */
  getStoredToken() {
    return localStorage.getItem('auth_token');
  },

  /**
   * Armazena o token no localStorage
   * @param {string} token - Token JWT
   */
  setToken(token) {
    localStorage.setItem('auth_token', token);
  },

  /**
   * Remove o token do localStorage
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
