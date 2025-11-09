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

// Response interceptor - Trata erros de autenticação
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    // Se receber erro 401 (Não Autorizado), token é inválido ou expirado
    if (status === 401) {
      console.warn('Token inválido ou expirado. Fazendo logout...');

      // Remove o token
      localStorage.removeItem('auth_token');

      // Redireciona para login (se não estiver na página de login)
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
      }
    }

    console.error('Response Error:', status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
