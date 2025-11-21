/**
 * Utilitários para geração de avatares
 */

/**
 * Paleta de gradientes vibrantes e profissionais para avatares
 */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Roxo
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Rosa
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Azul claro
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Verde água
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Rosa/amarelo
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Pastel
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // Rosa suave
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // Pêssego
  'linear-gradient(135deg, #667eea 0%, #f093fb 100%)', // Roxo/rosa
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)', // Turquesa/lilás
  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', // Lilás/creme
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', // Azul céu
];

/**
 * Gera um hash simples de uma string
 * @param {string} str - String para gerar hash
 * @returns {number} Hash numérico
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Gera um gradiente de cor consistente baseado no identificador do usuário
 * A cor será sempre a mesma para o mesmo usuário
 *
 * @param {string} identifier - Username, email ou qualquer identificador do usuário
 * @returns {string} CSS gradient string
 *
 * @example
 * generateAvatarGradient('john.doe@example.com')
 * // => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
 */
export const generateAvatarGradient = (identifier) => {
  if (!identifier || typeof identifier !== 'string') {
    return AVATAR_GRADIENTS[0]; // Fallback para primeiro gradiente
  }

  const index = simpleHash(identifier) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
};

/**
 * Obtém a inicial do usuário para exibir no avatar
 *
 * @param {Object} user - Objeto do usuário
 * @param {string} [user.username] - Username do usuário
 * @param {string} [user.email] - Email do usuário
 * @returns {string} Inicial em maiúscula
 *
 * @example
 * getAvatarInitial({ username: 'john', email: 'john@example.com' })
 * // => 'J'
 */
export const getAvatarInitial = (user) => {
  if (!user) return 'U';

  const identifier = user.username || user.email || '';
  return identifier[0]?.toUpperCase() || 'U';
};

/**
 * Obtém o nome de exibição do usuário
 * Prioriza username, depois email
 *
 * @param {Object} user - Objeto do usuário
 * @param {string} [user.username] - Username do usuário
 * @param {string} [user.email] - Email do usuário
 * @param {string} [fallback='Usuário'] - Texto de fallback
 * @returns {string} Nome para exibição
 */
export const getDisplayName = (user, fallback = 'Usuário') => {
  if (!user) return fallback;
  return user.username || user.email || fallback;
};
