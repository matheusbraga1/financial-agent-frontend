export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error) => {
  if (error.response) {
    const message = error.response.data?.detail || 'Erro ao processar requisição';
    return new ApiError(message, error.response.status, error.response.data);
  }
  
  if (error.request) {
    return new ApiError(
      'Servidor não está respondendo. Verifique sua conexão.',
      0,
      null
    );
  }
  
  return new ApiError(error.message || 'Erro desconhecido', -1, null);
};
