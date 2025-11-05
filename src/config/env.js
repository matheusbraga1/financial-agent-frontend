export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  enableLogs: import.meta.env.VITE_ENABLE_LOGS === 'true',
};