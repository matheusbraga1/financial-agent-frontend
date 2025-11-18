/**
 * Badge Premium da Financial
 * Componente de badge reutilizável com variantes estilizadas
 * - Cores da marca Financial
 * - Múltiplas variantes e tamanhos
 *
 * @param {'primary'|'secondary'|'success'|'warning'|'danger'|'info'|'neutral'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} dot - Mostrar ponto indicador
 * @param {boolean} pulse - Animar ponto
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
  ...props
}) => {
  // Variantes de cores
  const variants = {
    primary: `
      bg-gradient-to-r from-primary-100 to-primary-50
      dark:from-primary-900/30 dark:to-primary-800/20
      text-primary-800 dark:text-primary-200
      border border-primary-200 dark:border-primary-800
    `,
    secondary: `
      bg-gradient-to-r from-secondary-100 to-secondary-50
      dark:from-secondary-900/30 dark:to-secondary-800/20
      text-secondary-800 dark:text-secondary-200
      border border-secondary-200 dark:border-secondary-800
    `,
    success: `
      bg-gradient-to-r from-green-100 to-green-50
      dark:from-green-900/30 dark:to-green-800/20
      text-green-800 dark:text-green-200
      border border-green-200 dark:border-green-800
    `,
    warning: `
      bg-gradient-to-r from-yellow-100 to-yellow-50
      dark:from-yellow-900/30 dark:to-yellow-800/20
      text-yellow-800 dark:text-yellow-200
      border border-yellow-200 dark:border-yellow-800
    `,
    danger: `
      bg-gradient-to-r from-red-100 to-red-50
      dark:from-red-900/30 dark:to-red-800/20
      text-red-800 dark:text-red-200
      border border-red-200 dark:border-red-800
    `,
    info: `
      bg-gradient-to-r from-blue-100 to-blue-50
      dark:from-blue-900/30 dark:to-blue-800/20
      text-blue-800 dark:text-blue-200
      border border-blue-200 dark:border-blue-800
    `,
    neutral: `
      bg-gradient-to-r from-gray-100 to-gray-50
      dark:from-gray-700 dark:to-gray-800
      text-gray-800 dark:text-gray-200
      border border-gray-200 dark:border-gray-600
    `,
  };

  // Tamanhos
  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px] rounded-md',
    md: 'px-2 py-1 text-xs rounded-lg',
    lg: 'px-3 py-1.5 text-sm rounded-lg',
  };

  // Cores dos dots
  const dotColors = {
    primary: 'bg-primary-600 dark:bg-primary-400',
    secondary: 'bg-secondary-600 dark:bg-secondary-400',
    success: 'bg-green-600 dark:bg-green-400',
    warning: 'bg-yellow-600 dark:bg-yellow-400',
    danger: 'bg-red-600 dark:bg-red-400',
    info: 'bg-blue-600 dark:bg-blue-400',
    neutral: 'bg-gray-600 dark:bg-gray-400',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${sizes[size]}
        ${variants[variant]}
        font-semibold
        shadow-sm
        transition-all duration-200
        ${className}
      `}
      {...props}
    >
      {dot && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full
            ${dotColors[variant]}
            ${pulse ? 'animate-pulse' : ''}
          `}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
