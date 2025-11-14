/**
 * Tipos e interfaces para gerenciamento de documentos
 * Sincronizado com backend FastAPI (refactor/app-solid-arch)
 * Endpoints: /api/v1/documents
 */

/**
 * @typedef {Object} IngestDocumentRequest
 * @property {string} title - Título do documento (3-500 caracteres)
 * @property {string} content - Conteúdo do documento (mínimo 50 caracteres)
 * @property {string} [category] - Categoria (padrão: "Documento", máx 100 chars)
 * @property {string} [department] - Departamento (máx 50 chars)
 * @property {string} [tags] - Tags separadas por vírgula
 */

/**
 * @typedef {Object} IngestDocumentResponse
 * @property {number} chunks_processed - Número de chunks processados
 * @property {Array<string>} document_ids - IDs dos documentos criados
 * @property {string} status - Status do processamento
 * @property {string} message - Mensagem de sucesso
 */

/**
 * @typedef {Object} UploadFileRequest
 * @property {File} file - Arquivo (.txt, .md, .pdf)
 * @property {string} [category] - Categoria (padrão: "Documento")
 * @property {string} [department] - Departamento
 * @property {string} [tags] - Tags separadas por vírgula
 */

/**
 * @typedef {Object} UploadFileResponse
 * @property {string} filename - Nome do arquivo processado
 * @property {number} chunks_processed - Número de chunks processados
 * @property {Array<string>} document_ids - IDs dos documentos criados
 * @property {string} status - Status do processamento
 * @property {string} message - Mensagem de sucesso
 */

/**
 * @typedef {Object} CollectionStats
 * @property {string} collection_name - Nome da coleção
 * @property {number} total_documents - Total de documentos
 * @property {number} indexed_documents - Documentos indexados
 * @property {string} status - Status da coleção
 */

/**
 * @typedef {Object} DocumentHealthResponse
 * @property {string} status - Status do serviço
 * @property {string} service - Nome do serviço
 */

/**
 * Constantes
 */
export const DOCUMENT_CONSTANTS = {
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 500,
  CONTENT_MIN_LENGTH: 50,
  CATEGORY_MAX_LENGTH: 100,
  DEPARTMENT_MAX_LENGTH: 50,
  ALLOWED_FILE_TYPES: ['.txt', '.md', '.pdf'],
  ALLOWED_MIME_TYPES: ['text/plain', 'text/markdown', 'application/pdf'],
  DEFAULT_CATEGORY: 'Documento',
};

/**
 * Validadores
 */
export const validators = {
  /**
   * Valida título do documento
   * @param {string} title
   * @returns {boolean}
   */
  isValidTitle(title) {
    return (
      typeof title === 'string' &&
      title.length >= DOCUMENT_CONSTANTS.TITLE_MIN_LENGTH &&
      title.length <= DOCUMENT_CONSTANTS.TITLE_MAX_LENGTH
    );
  },

  /**
   * Valida conteúdo do documento
   * @param {string} content
   * @returns {boolean}
   */
  isValidContent(content) {
    return (
      typeof content === 'string' &&
      content.length >= DOCUMENT_CONSTANTS.CONTENT_MIN_LENGTH
    );
  },

  /**
   * Valida categoria
   * @param {string} category
   * @returns {boolean}
   */
  isValidCategory(category) {
    return (
      typeof category === 'string' &&
      category.length <= DOCUMENT_CONSTANTS.CATEGORY_MAX_LENGTH
    );
  },

  /**
   * Valida departamento
   * @param {string} department
   * @returns {boolean}
   */
  isValidDepartment(department) {
    return (
      typeof department === 'string' &&
      department.length <= DOCUMENT_CONSTANTS.DEPARTMENT_MAX_LENGTH
    );
  },

  /**
   * Valida tipo de arquivo
   * @param {File} file
   * @returns {boolean}
   */
  isValidFileType(file) {
    if (!file || !(file instanceof File)) return false;

    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return DOCUMENT_CONSTANTS.ALLOWED_FILE_TYPES.includes(fileExtension);
  },

  /**
   * Valida MIME type
   * @param {File} file
   * @returns {boolean}
   */
  isValidMimeType(file) {
    if (!file || !(file instanceof File)) return false;
    return DOCUMENT_CONSTANTS.ALLOWED_MIME_TYPES.includes(file.type);
  },
};

/**
 * Helpers
 */
export const helpers = {
  /**
   * Formata tags para envio ao backend
   * @param {Array<string>|string} tags
   * @returns {string}
   */
  formatTags(tags) {
    if (Array.isArray(tags)) {
      return tags.join(',');
    }
    return tags || '';
  },

  /**
   * Parseia tags do backend
   * @param {string} tags
   * @returns {Array<string>}
   */
  parseTags(tags) {
    if (!tags) return [];
    return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  },

  /**
   * Obtém a extensão do arquivo
   * @param {string} filename
   * @returns {string}
   */
  getFileExtension(filename) {
    return '.' + filename.split('.').pop().toLowerCase();
  },

  /**
   * Formata tamanho de arquivo para exibição
   * @param {number} bytes
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },
};
