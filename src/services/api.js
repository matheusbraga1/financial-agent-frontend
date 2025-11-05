import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000
});

api.interceptors.request.use(
    (config) => {
        console.log('Request:', config.method.toUpperCase(), config.url);
        return config;
    },
    (error) => {
        console.log('Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log('Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.log('Response Error:', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export const chatService = {
    async sendMessage(question, sessionId = null) {
        try {
            const response = await api.post('/chat/chat', {
                question,
                sessionId: sessionId
            });
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    },

    async sendMessageStream(question, sessionId, onMessage, onError, onComplete) {
        const url = `${API_BASE_URL}/chat/chat/stream`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 120000);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream'
                },
                body: JSON.stringify({
                    question,
                    sessionId: sessionId
                }),
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onComplete?.();
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split(/\r?\n/);
                buffer = parts.pop() ?? '';

                for (const raw of parts) {
                    const line = raw.trim();
                    if (!line) continue;
                    if (line.startsWith('data: ')) {
                        const payload = line.slice(5).trim();
                        if (!payload) continue;
                        try {
                            const data = JSON.parse(payload);
                            onMessage?.(data);
                        } catch (e) {
                            console.error('Erro ao parsear SSE JSON:', e, 'payload:', payload);
                        }
                    }
                }
            }

            reader.releaseLock();
        } catch (error) {
            console.error('Erro no streaming:', error);
            onError?.(error);
        } finally {
            clearTimeout(timer);
            controller.abort();
        }
    },

    async getModels() {
        try {
            const response = api.get('/chat/models');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    },

    async healthCheck() {
        try {
            const response = await api.get('/chat/health');
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    },

    async sendFeedback(sessionId, messageId, rating, comment = null) {
        try {
            const response = await api.post('/chat/feedback', undefined, {
                params: {
                    session_id: sessionId,
                    message_id: messageId,
                    rating,
                    comment,
                },
        });
            return response.data;
        } catch (error) {
            throw this._handleError(error);
        }
    },

    _handleError(error) {
        let normalized;
        if (error.response) {
                normalized = {
                message: error.response.data?.detail || 'Erro ao processar requisição',
                status: error.response.status,
                data: error.response.data,
            };
        } else if (error.request) {
            normalized = {
                message: 'Servidor não está respondendo. Verifique sua conexão.',
                status: 0
            };
        } else {
            normalized = {
                message: error.message || 'Erro desconhecido',
                status: -1,
            };
        }
        const err = new Error(normalized.message);
        Object.assign(err, normalized);
        return err;
    }
};

export default api;