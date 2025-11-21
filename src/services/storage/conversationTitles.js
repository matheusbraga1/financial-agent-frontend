/**
 * Serviço de Títulos de Conversas Customizados
 *
 * Persiste títulos customizados no localStorage para permitir
 * que usuários renomeiem suas conversas de forma organizada.
 *
 * @module conversationTitles
 */

const STORAGE_KEY = 'financial_agent_conversation_titles';

/**
 * Obtém todos os títulos customizados do localStorage
 * @returns {Object} Mapa de sessionId -> título customizado
 */
const getAllTitles = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Erro ao ler títulos do localStorage:', error);
    return {};
  }
};

/**
 * Salva todos os títulos no localStorage
 * @param {Object} titles - Mapa de sessionId -> título
 */
const saveTitles = (titles) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(titles));
  } catch (error) {
    console.error('Erro ao salvar títulos no localStorage:', error);
  }
};

/**
 * Obtém o título customizado de uma sessão específica
 * @param {string} sessionId - ID da sessão
 * @returns {string|null} Título customizado ou null se não existir
 */
export const getCustomTitle = (sessionId) => {
  if (!sessionId) return null;
  const titles = getAllTitles();
  return titles[sessionId] || null;
};

/**
 * Define um título customizado para uma sessão
 * @param {string} sessionId - ID da sessão
 * @param {string} title - Novo título (se vazio, remove o título customizado)
 */
export const setCustomTitle = (sessionId, title) => {
  if (!sessionId) return;

  const titles = getAllTitles();

  if (title && title.trim()) {
    // Salva título customizado (limitado a 100 caracteres)
    titles[sessionId] = title.trim().substring(0, 100);
  } else {
    // Remove título customizado (volta ao padrão)
    delete titles[sessionId];
  }

  saveTitles(titles);
};

/**
 * Remove o título customizado de uma sessão
 * @param {string} sessionId - ID da sessão
 */
export const removeCustomTitle = (sessionId) => {
  if (!sessionId) return;

  const titles = getAllTitles();
  delete titles[sessionId];
  saveTitles(titles);
};

/**
 * Remove títulos de sessões que não existem mais
 * Útil para limpeza de dados obsoletos
 * @param {string[]} validSessionIds - IDs de sessões válidas
 */
export const cleanupOrphanedTitles = (validSessionIds) => {
  const titles = getAllTitles();
  const validSet = new Set(validSessionIds);

  const cleanedTitles = Object.fromEntries(
    Object.entries(titles).filter(([sessionId]) => validSet.has(sessionId))
  );

  saveTitles(cleanedTitles);
};

/**
 * Limpa todos os títulos customizados
 * Útil para reset ou logout
 */
export const clearAllTitles = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao limpar títulos:', error);
  }
};

/**
 * Hook-friendly: Obtém título para exibição
 * Retorna título customizado ou fallback para last_message
 * @param {string} sessionId - ID da sessão
 * @param {string} fallback - Texto padrão (geralmente last_message)
 * @returns {string} Título para exibição
 */
export const getDisplayTitle = (sessionId, fallback = 'Nova conversa') => {
  const customTitle = getCustomTitle(sessionId);
  return customTitle || fallback;
};

export default {
  getCustomTitle,
  setCustomTitle,
  removeCustomTitle,
  cleanupOrphanedTitles,
  clearAllTitles,
  getDisplayTitle,
};
