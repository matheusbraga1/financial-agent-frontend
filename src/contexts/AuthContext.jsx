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
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          // Token inválido ou expirado
          console.error('Token inválido:', error);
          authService.removeToken();
          setToken(null);
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
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // Faz login e recebe os tokens
      const response = await authService.login(email, password);
      const { access_token, refresh_token } = response;

      // Armazena os tokens
      authService.setToken(access_token);
      setToken(access_token);

      // Armazena o refresh token se disponível
      if (refresh_token) {
        authService.setRefreshToken(refresh_token);
      }

      // Busca os dados do usuário
      const userData = await authService.getCurrentUser();
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
  const register = useCallback(async (email, password, name) => {
    setLoading(true);
    try {
      // Registra o usuário
      await authService.register(email, password, name);

      // Faz login automaticamente após o registro
      // O toast de boas-vindas será exibido pelo login
      const loginResult = await login(email, password);

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
      // Chama o endpoint de logout (revoga o token)
      await authService.logout();

      // Limpa o estado local e tokens
      authService.removeToken();
      authService.removeRefreshToken();
      setToken(null);
      setUser(null);
    } catch (error) {
      // Mesmo se falhar, limpa o estado local
      authService.removeToken();
      authService.removeRefreshToken();
      setToken(null);
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
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
      // Se falhar, faz logout
      await logout();
    }
  }, [token, logout]);

  const value = {
    // Estado
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.is_admin || false,
    loading,
    initializing,

    // Métodos
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
