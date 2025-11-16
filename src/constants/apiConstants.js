export const API_TIMEOUT = 30000;

// FIX: Aumentado de 120s para 300s (5 minutos) para acomodar fallback GROQ→Ollama
// Quando GROQ falha, o backend faz fallback para Ollama, que pode demorar mais para responder,
// especialmente em hardware limitado ou quando precisa carregar o modelo pela primeira vez
export const STREAM_TIMEOUT = 300000; // 5 minutos

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};