import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/api/authService';
import toast from 'react-hot-toast';

/**
 * Context de autenticação
 */
const AuthContext = createContext(null);

/**
 * Hook para usar o contexto de autenticação
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

/**
 * Provider de autenticação
 * Gerencia o estado global de autenticação da aplicação
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(authService.getStoredToken());
  const [refreshToken, setRefreshToken] = useState(authService.getStoredRefreshToken());
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  /**
   * Verifica se o usuário está autenticado ao carregar a aplicação
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = authService.getStoredToken();

      if (storedToken) {
        try {
          // Tenta buscar os dados do usuário com o token armazenado
          const response = await authService.getCurrentUser();
          // Backend retorna { user: {...}, message: "..." }
          const userData = response.user || response;
          setUser(userData);
          setToken(storedToken);

          const storedRefreshToken = authService.getStoredRefreshToken();
          if (storedRefreshToken) {
            setRefreshToken(storedRefreshToken);
          }
        } catch (error) {
          // Token inválido ou expirado
          console.error('Token inválido:', error);
          authService.removeTokens();
          setToken(null);
          setRefreshToken(null);
          setUser(null);
        }
      }

      setInitializing(false);
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Faz login do usuário
   */
  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      // Faz login e recebe os tokens
      const response = await authService.login(username, password);
      const { access_token, refresh_token } = response;

      // Armazena os tokens
      authService.setTokens(access_token, refresh_token);
      setToken(access_token);
      setRefreshToken(refresh_token);

      // Busca os dados do usuário
      const userResponse = await authService.getCurrentUser();
      // Backend retorna { user: {...}, message: "..." }
      const userData = userResponse.user || userResponse;
      setUser(userData);

      toast.success(`Bem-vindo, ${userData.username || userData.email}!`);
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer login');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registra um novo usuário
   */
  const register = useCallback(async (username, email, password) => {
    setLoading(true);
    try {
      // Registra o usuário
      await authService.register(username, email, password);

      // Faz login automaticamente após o registro
      // O toast de boas-vindas será exibido pelo login
      const loginResult = await login(username, password);

      return loginResult;
    } catch (error) {
      toast.error(error.message || 'Erro ao criar conta');
      setLoading(false);
      return { success: false, error: error.message };
    }
  }, [login]);

  /**
   * Faz logout do usuário
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // Chama o endpoint de logout (revoga o refresh token)
      const currentRefreshToken = authService.getStoredRefreshToken();
      if (currentRefreshToken) {
        await authService.logout(currentRefreshToken);
      }

      // Limpa o estado local
      authService.removeTokens();
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    } catch (error) {
      // Mesmo se falhar, limpa o estado local
      authService.removeTokens();
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza os dados do usuário
   */
  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const response = await authService.getCurrentUser();
      // Backend retorna { user: {...}, message: "..." }
      const userData = response.user || response;
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      // Se falhar, faz logout
      await logout();
    }
  }, [token, logout]);

  /**
   * Atualiza o access token usando o refresh token
   */
  const refreshAccessToken = useCallback(async () => {
    const currentRefreshToken = authService.getStoredRefreshToken();

    if (!currentRefreshToken) {
      console.warn('Nenhum refresh token disponível');
      await logout();
      return false;
    }

    try {
      const response = await authService.refreshAccessToken(currentRefreshToken);
      const { access_token, refresh_token } = response;

      // Atualiza os tokens
      authService.setTokens(access_token, refresh_token);
      setToken(access_token);
      setRefreshToken(refresh_token);

      return true;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      // Se falhar, faz logout
      await logout();
      return false;
    }
  }, [logout]);

  const value = {
    // Estado
    user,
    token,
    refreshToken,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.is_admin || false,
    loading,
    initializing,

    // Métodos
    login,
    register,
    logout,
    refreshUser,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
