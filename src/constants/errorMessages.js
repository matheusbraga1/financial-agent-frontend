/**
 * Mensagens de Erro Padronizadas da Financial
 *
 * Sistema centralizado de mensagens de erro profissionais e amigáveis.
 * Mantém consistência em toda a aplicação.
 */

// ========================================
// AUTENTICAÇÃO
// ========================================
export const AUTH_ERRORS = {
  // Login
  INVALID_CREDENTIALS: {
    title: 'Credenciais inválidas',
    message: 'Usuário ou senha incorretos. Por favor, verifique seus dados e tente novamente.',
    suggestion: 'Esqueceu sua senha? Entre em contato com o administrador.',
  },
  USER_NOT_FOUND: {
    title: 'Usuário não encontrado',
    message: 'Não encontramos uma conta com este usuário.',
    suggestion: 'Verifique se digitou corretamente ou crie uma nova conta.',
  },
  ACCOUNT_LOCKED: {
    title: 'Conta bloqueada',
    message: 'Sua conta foi temporariamente bloqueada por segurança.',
    suggestion: 'Entre em contato com o suporte para desbloquear.',
  },

  // Registro
  USERNAME_TAKEN: {
    title: 'Nome de usuário indisponível',
    message: 'Este nome de usuário já está sendo utilizado.',
    suggestion: 'Escolha outro nome de usuário e tente novamente.',
  },
  EMAIL_TAKEN: {
    title: 'E-mail já cadastrado',
    message: 'Já existe uma conta com este endereço de e-mail.',
    suggestion: 'Faça login ou use outro e-mail para criar uma nova conta.',
  },
  WEAK_PASSWORD: {
    title: 'Senha muito fraca',
    message: 'A senha deve ter no mínimo 8 caracteres.',
    suggestion: 'Use uma combinação de letras, números e caracteres especiais.',
  },

  // Token
  TOKEN_EXPIRED: {
    title: 'Sessão expirada',
    message: 'Sua sessão expirou por inatividade.',
    suggestion: 'Por favor, faça login novamente para continuar.',
  },
  INVALID_TOKEN: {
    title: 'Sessão inválida',
    message: 'Não foi possível validar sua sessão.',
    suggestion: 'Faça login novamente para acessar o sistema.',
  },
  REFRESH_TOKEN_FAILED: {
    title: 'Erro ao renovar sessão',
    message: 'Não foi possível renovar sua sessão automaticamente.',
    suggestion: 'Por favor, faça login novamente.',
  },

  // Logout
  LOGOUT_FAILED: {
    title: 'Erro ao sair',
    message: 'Ocorreu um erro ao encerrar sua sessão.',
    suggestion: 'Tente novamente ou feche o navegador.',
  },
};

// ========================================
// CHAT E MENSAGENS
// ========================================
export const CHAT_ERRORS = {
  SEND_MESSAGE_FAILED: {
    title: 'Erro ao enviar mensagem',
    message: 'Não foi possível enviar sua mensagem no momento.',
    suggestion: 'Verifique sua conexão e tente novamente.',
  },
  LOAD_HISTORY_FAILED: {
    title: 'Erro ao carregar histórico',
    message: 'Não foi possível carregar o histórico de conversas.',
    suggestion: 'Atualize a página ou tente novamente mais tarde.',
  },
  LOAD_SESSION_FAILED: {
    title: 'Erro ao carregar conversa',
    message: 'Não foi possível carregar esta conversa.',
    suggestion: 'A conversa pode ter sido excluída. Tente outra.',
  },
  DELETE_SESSION_FAILED: {
    title: 'Erro ao excluir conversa',
    message: 'Não foi possível excluir esta conversa.',
    suggestion: 'Tente novamente em alguns instantes.',
  },
  CREATE_SESSION_FAILED: {
    title: 'Erro ao criar conversa',
    message: 'Não foi possível iniciar uma nova conversa.',
    suggestion: 'Atualize a página e tente novamente.',
  },
  STREAM_CONNECTION_FAILED: {
    title: 'Erro de conexão',
    message: 'A conexão com o servidor foi interrompida.',
    suggestion: 'Verifique sua internet e recarregue a página.',
  },
  MESSAGE_TOO_LONG: {
    title: 'Mensagem muito longa',
    message: 'Sua mensagem excede o limite de caracteres permitido.',
    suggestion: 'Reduza o tamanho da mensagem e tente novamente.',
  },
  EMPTY_MESSAGE: {
    title: 'Mensagem vazia',
    message: 'Por favor, digite uma mensagem antes de enviar.',
    suggestion: 'Digite sua pergunta ou solicitação no campo de texto.',
  },
};

// ========================================
// DOCUMENTOS (ADMIN)
// ========================================
export const DOCUMENT_ERRORS = {
  UPLOAD_FAILED: {
    title: 'Erro no upload',
    message: 'Não foi possível fazer upload do documento.',
    suggestion: 'Verifique o formato do arquivo e tente novamente.',
  },
  FILE_TOO_LARGE: {
    title: 'Arquivo muito grande',
    message: 'O arquivo excede o tamanho máximo permitido.',
    suggestion: 'Reduza o tamanho do arquivo ou divida em partes menores.',
  },
  INVALID_FILE_TYPE: {
    title: 'Formato inválido',
    message: 'Este formato de arquivo não é suportado.',
    suggestion: 'Use arquivos .txt, .pdf ou .md.',
  },
  INGEST_FAILED: {
    title: 'Erro ao processar documento',
    message: 'Não foi possível processar o conteúdo do documento.',
    suggestion: 'Verifique se o documento está corrompido.',
  },
  PERMISSION_DENIED: {
    title: 'Acesso negado',
    message: 'Você não tem permissão para realizar esta ação.',
    suggestion: 'Entre em contato com um administrador.',
  },
};

// ========================================
// VALIDAÇÃO DE FORMULÁRIOS
// ========================================
export const VALIDATION_ERRORS = {
  REQUIRED_FIELD: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Digite um endereço de e-mail válido',
  INVALID_USERNAME: 'Use apenas letras, números e underscores (_)',
  USERNAME_TOO_SHORT: 'O nome de usuário deve ter no mínimo 3 caracteres',
  USERNAME_TOO_LONG: 'O nome de usuário deve ter no máximo 50 caracteres',
  PASSWORD_TOO_SHORT: 'A senha deve ter no mínimo 8 caracteres',
  PASSWORD_MISMATCH: 'As senhas não coincidem',
  INVALID_FORMAT: 'Formato inválido. Verifique os dados digitados',
};

// ========================================
// REDE E CONEXÃO
// ========================================
export const NETWORK_ERRORS = {
  NO_CONNECTION: {
    title: 'Sem conexão',
    message: 'Você está offline. Verifique sua conexão com a internet.',
    suggestion: 'Reconecte-se e atualize a página para continuar.',
  },
  TIMEOUT: {
    title: 'Tempo esgotado',
    message: 'O servidor demorou muito para responder.',
    suggestion: 'Verifique sua conexão e tente novamente.',
  },
  SERVER_ERROR: {
    title: 'Erro no servidor',
    message: 'O servidor encontrou um problema ao processar sua solicitação.',
    suggestion: 'Nossa equipe foi notificada. Tente novamente em breve.',
  },
  SERVICE_UNAVAILABLE: {
    title: 'Serviço temporariamente indisponível',
    message: 'O sistema está passando por manutenção.',
    suggestion: 'Aguarde alguns minutos e tente novamente.',
  },
  RATE_LIMIT: {
    title: 'Muitas tentativas',
    message: 'Você fez muitas solicitações em pouco tempo.',
    suggestion: 'Aguarde alguns minutos antes de tentar novamente.',
  },
};

// ========================================
// ERROS GENÉRICOS
// ========================================
export const GENERIC_ERRORS = {
  UNKNOWN: {
    title: 'Erro inesperado',
    message: 'Ocorreu um erro inesperado. Pedimos desculpas pelo inconveniente.',
    suggestion: 'Tente novamente ou entre em contato com o suporte se o problema persistir.',
  },
  FEATURE_NOT_AVAILABLE: {
    title: 'Recurso indisponível',
    message: 'Este recurso não está disponível no momento.',
    suggestion: 'Tente novamente mais tarde ou use outra funcionalidade.',
  },
  MAINTENANCE: {
    title: 'Manutenção programada',
    message: 'O sistema está em manutenção.',
    suggestion: 'Voltaremos em breve. Agradecemos sua compreensão.',
  },
};

// ========================================
// MENSAGENS DE SUCESSO
// ========================================
export const SUCCESS_MESSAGES = {
  // Autenticação
  LOGIN_SUCCESS: 'Login realizado com sucesso! Bem-vindo de volta.',
  LOGOUT_SUCCESS: 'Você saiu da sua conta com segurança.',
  REGISTER_SUCCESS: 'Conta criada com sucesso! Faça login para começar.',

  // Chat
  MESSAGE_SENT: 'Mensagem enviada',
  SESSION_CREATED: 'Nova conversa iniciada',
  SESSION_DELETED: 'Conversa excluída com sucesso',

  // Documentos
  DOCUMENT_UPLOADED: 'Documento enviado com sucesso',
  DOCUMENT_PROCESSED: 'Documento processado e indexado',

  // Genérico
  CHANGES_SAVED: 'Alterações salvas com sucesso',
  OPERATION_COMPLETED: 'Operação concluída com sucesso',
};

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Mapeia código de erro HTTP para mensagem apropriada
 */
export const getErrorByStatusCode = (status) => {
  const errorMap = {
    400: GENERIC_ERRORS.UNKNOWN,
    401: AUTH_ERRORS.INVALID_TOKEN,
    403: DOCUMENT_ERRORS.PERMISSION_DENIED,
    404: CHAT_ERRORS.LOAD_SESSION_FAILED,
    408: NETWORK_ERRORS.TIMEOUT,
    429: NETWORK_ERRORS.RATE_LIMIT,
    500: NETWORK_ERRORS.SERVER_ERROR,
    502: NETWORK_ERRORS.SERVER_ERROR,
    503: NETWORK_ERRORS.SERVICE_UNAVAILABLE,
    504: NETWORK_ERRORS.TIMEOUT,
  };

  return errorMap[status] || NETWORK_ERRORS.SERVER_ERROR;
};

/**
 * Extrai mensagem de erro de resposta da API
 */
export const extractErrorMessage = (error) => {
  // Se já é um objeto de erro formatado
  if (error.title && error.message) {
    return error;
  }

  // Se tem resposta da API
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Mensagem customizada do backend
    if (data?.detail) {
      return {
        title: getErrorByStatusCode(status).title,
        message: data.detail,
        suggestion: getErrorByStatusCode(status).suggestion,
      };
    }

    return getErrorByStatusCode(status);
  }

  // Erro de rede
  if (error.request) {
    return NETWORK_ERRORS.NO_CONNECTION;
  }

  // Erro desconhecido
  return GENERIC_ERRORS.UNKNOWN;
};

/**
 * Formata mensagem para exibição em toast
 */
export const formatToastMessage = (errorObj) => {
  if (typeof errorObj === 'string') {
    return errorObj;
  }

  return errorObj.message || errorObj.title || 'Erro desconhecido';
};

/**
 * Formata mensagem completa para exibição em componente
 */
export const formatFullErrorMessage = (errorObj) => {
  if (typeof errorObj === 'string') {
    return {
      title: 'Erro',
      message: errorObj,
      suggestion: null,
    };
  }

  return {
    title: errorObj.title || 'Erro',
    message: errorObj.message || 'Ocorreu um erro inesperado',
    suggestion: errorObj.suggestion || null,
  };
};

export default {
  AUTH_ERRORS,
  CHAT_ERRORS,
  DOCUMENT_ERRORS,
  VALIDATION_ERRORS,
  NETWORK_ERRORS,
  GENERIC_ERRORS,
  SUCCESS_MESSAGES,
  getErrorByStatusCode,
  extractErrorMessage,
  formatToastMessage,
  formatFullErrorMessage,
};
