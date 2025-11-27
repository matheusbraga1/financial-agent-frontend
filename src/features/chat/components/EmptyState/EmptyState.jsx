import PropTypes from 'prop-types';

/**
 * Retorna saudação baseada no horário local
 */
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

/**
 * Gera lista de saudações, incluindo personalizadas se usuário logado
 */
const getGreetings = (userName) => {
  const baseGreetings = [
    'Como posso ajudar você hoje?',
    'Em que posso ajudar?',
    'O que gostaria de saber?',
    'Como posso ser útil?',
    'Qual é sua dúvida?',
    'No que posso auxiliar?',
  ];

  if (!userName) return baseGreetings;

  const timeGreeting = getTimeGreeting();
  const firstName = userName.split(' ')[0];

  const personalizedGreetings = [
    `${timeGreeting}, ${firstName}!`,
    `${timeGreeting}, ${firstName}! Como posso ajudar?`,
    `Olá, ${firstName}! Em que posso ajudar?`,
    `${firstName}, como posso ser útil hoje?`,
  ];

  return [...personalizedGreetings, ...baseGreetings];
};

/**
 * EmptyState estilo Claude - Minimalista e Mobile-First
 * - Logo ao lado esquerdo do título
 * - Design limpo e profissional
 * - Responsivo para todos os tamanhos
 * - Saudações personalizadas com nome e horário
 */
const EmptyState = ({ greetingIndex = 0, userName = null }) => {
  const greetings = getGreetings(userName);
  const greeting = greetings[greetingIndex % greetings.length];

  return (
    <div className="flex items-center justify-center animate-fade-in px-4">
      <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-normal text-gray-900 dark:text-gray-100 tracking-tight text-center">
        {greeting}
      </h1>
    </div>
  );
};

EmptyState.propTypes = {
  greetingIndex: PropTypes.number,
  userName: PropTypes.string,
};

export default EmptyState;
