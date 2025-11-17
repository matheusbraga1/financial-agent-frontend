import axios from 'axios';
import { config } from '../../config/env';
import { API_TIMEOUT } from '../../constants/apiConstants';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue = [];

/**
 * Processa a fila de requisições que falharam durante o refresh
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Adiciona token JWT automaticamente
apiClient.interceptors.request.use(
  (config) => {
    // Busca o token do localStorage
    const token = localStorage.getItem('auth_token');

    // Se existir token, adiciona no header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log('Request:', config.method?.toUpperCase(), config.url);
      if (token) {
        console.log('Token incluído na requisição');
      }
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Trata erros de autenticação com refresh token automático
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Se receber erro 401 (Não Autorizado) e não for a rota de refresh
    if (status === 401 && !originalRequest._retry) {
      // Se for a rota de login, refresh ou logout, não tenta refresh
      const isAuthEndpoint =
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/logout');

      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      // Marca que já tentou fazer refresh nesta requisição
      originalRequest._retry = true;

      // Se já está fazendo refresh, adiciona na fila
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      // Se não houver refresh token, faz logout
      if (!refreshToken) {
        console.warn('Refresh token não encontrado. Fazendo logout...');
        isRefreshing = false;
        processQueue(error, null);

        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');

        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // Tenta renovar o token
      try {
        const response = await apiClient.post('/auth/refresh', {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Atualiza os tokens
        localStorage.setItem('auth_token', access_token);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Atualiza o header da requisição original
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Processa a fila de requisições pendentes
        processQueue(null, access_token);

        isRefreshing = false;

        // Tenta novamente a requisição original
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Se o refresh falhar, faz logout
        console.warn('Refresh token inválido ou expirado. Fazendo logout...');

        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');

        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      }
    }

    console.error('Response Error:', status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
