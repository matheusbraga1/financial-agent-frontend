import api from './axios.config';

/**
 * Serviço de gerenciamento de documentos (Admin)
 * Integração com endpoints de documentos do backend
 */
const documentsService = {
  /**
   * Faz upload de um arquivo de documento
   * @param {File} file - Arquivo a ser enviado
   * @param {string} category - Categoria do documento (opcional)
   * @param {string} department - Departamento (opcional)
   * @param {string} tags - Tags separadas por vírgula (opcional)
   * @returns {Promise<{message: string, filename: string, chunks_processed: number, chunks_failed: number, document_ids: array}>}
   */
  async uploadDocument(file, category = 'Documento', department = '', tags = '') {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      if (department) {
        formData.append('department', department);
      }

      if (tags) {
        formData.append('tags', tags);
      }

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Ingere conteúdo de documento manualmente
   * @param {string} title - Título do documento
   * @param {string} content - Conteúdo do documento
   * @param {string} category - Categoria (opcional)
   * @param {string} department - Departamento (opcional)
   * @param {string} tags - Tags separadas por vírgula (opcional)
   * @returns {Promise<{message: string, chunks_processed: number, chunks_failed: number, document_ids: array}>}
   */
  async ingestDocument(title, content, category = 'Documento', department = '', tags = '') {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);

      if (department) {
        formData.append('department', department);
      }

      if (tags) {
        formData.append('tags', tags);
      }

      const response = await api.post('/documents/ingest', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Busca estatísticas da coleção de documentos
   * @returns {Promise<{collection: string, total_documents: number, indexed_documents: number, status: string}>}
   */
  async getStats() {
    try {
      const response = await api.get('/documents/stats');
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Verifica saúde do serviço de documentos
   * @returns {Promise<{status: string, service: string}>}
   */
  async healthCheck() {
    try {
      const response = await api.get('/documents/health');
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  },

  /**
   * Trata erros da API e retorna mensagens amigáveis
   * @private
   */
  _handleError(error) {
    if (error.response) {
      const { status, data } = error.response;

      const errorMessages = {
        400: data?.detail || 'Dados inválidos. Verifique os campos.',
        401: 'Acesso negado. Faça login novamente.',
        403: 'Acesso negado. Esta ação requer permissões de administrador.',
        413: 'Arquivo muito grande. Tamanho máximo: 50MB.',
        415: 'Tipo de arquivo não suportado. Use .txt, .md, .pdf ou .docx.',
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

export default documentsService;
