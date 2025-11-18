import { apiClient } from './axios.config';
import { handleApiError } from '../../utils/helpers/errorHandler';
import { validators, helpers } from '../../types/documentTypes';

/**
 * Serviço de Documentos - Comunicação com a API de Documents
 * Sincronizado com backend FastAPI
 * Requer permissões de administrador
 */
class DocumentService {
  /**
   * Ingere um documento de texto (somente admin)
   * @param {Object} params - Parâmetros do documento
   * @param {string} params.title - Título do documento (3-500 caracteres)
   * @param {string} params.content - Conteúdo do documento (mínimo 50 caracteres)
   * @param {string} [params.category] - Categoria (padrão: "Documento")
   * @param {string} [params.department] - Departamento
   * @param {Array<string>|string} [params.tags] - Tags
   * @returns {Promise<{chunks_processed: number, document_ids: Array<string>, status: string, message: string}>}
   */
  async ingestDocument({ title, content, category, department, tags }) {
    try {
      // Validações
      if (!validators.isValidTitle(title)) {
        throw new Error('Título inválido. Deve ter entre 3 e 500 caracteres.');
      }

      if (!validators.isValidContent(content)) {
        throw new Error('Conteúdo inválido. Deve ter no mínimo 50 caracteres.');
      }

      // Prepara os dados usando FormData (backend espera multipart/form-data)
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);

      if (category) {
        formData.append('category', category);
      }

      if (department) {
        formData.append('department', department);
      }

      if (tags) {
        const formattedTags = helpers.formatTags(tags);
        if (formattedTags) {
          formData.append('tags', formattedTags);
        }
      }

      const response = await apiClient.post('/documents/ingest', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Faz upload de um arquivo de documento (somente admin)
   * @param {Object} params - Parâmetros do upload
   * @param {File} params.file - Arquivo (.txt, .md, .pdf)
   * @param {string} [params.category] - Categoria
   * @param {string} [params.department] - Departamento
   * @param {Array<string>|string} [params.tags] - Tags
   * @returns {Promise<{filename: string, chunks_processed: number, document_ids: Array<string>, status: string, message: string}>}
   */
  async uploadDocument({ file, category, department, tags }) {
    try {
      // Validações
      if (!file || !(file instanceof File)) {
        throw new Error('Arquivo inválido.');
      }

      if (!validators.isValidFileType(file)) {
        throw new Error('Tipo de arquivo não suportado. Use .txt, .md ou .pdf');
      }

      // Prepara os dados usando FormData
      const formData = new FormData();
      formData.append('file', file);

      if (category) {
        formData.append('category', category);
      }

      if (department) {
        formData.append('department', department);
      }

      if (tags) {
        const formattedTags = helpers.formatTags(tags);
        if (formattedTags) {
          formData.append('tags', formattedTags);
        }
      }

      const response = await apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Busca estatísticas da coleção de documentos (somente admin)
   * @returns {Promise<{collection_name: string, total_documents: number, indexed_documents: number, status: string}>}
   */
  async getStats() {
    try {
      const response = await apiClient.get('/documents/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Verifica saúde da API de documentos
   * @returns {Promise<{status: string, service: string}>}
   */
  async healthCheck() {
    try {
      const response = await apiClient.get('/documents/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const documentService = new DocumentService();
export default documentService;
