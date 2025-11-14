import { Loader2 } from 'lucide-react';

/**
 * Button Premium da Financial
 * Componente de botão reutilizável com variantes estilizadas
 * - Verde #00884f (primary)
 * - Dourado #bf9c4b (secondary)
 * - Totalmente acessível e responsivo
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant - Variante visual
 * @param {'sm'|'md'|'lg'} size - Tamanho do botão
 * @param {boolean} loading - Estado de carregamento
 * @param {boolean} fullWidth - Ocupar largura total
 * @param {ReactNode} leftIcon - Ícone à esquerda
 * @param {ReactNode} rightIcon - Ícone à direita
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  ...props
}) => {
  // Variantes de estilo
  const variants = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-500
      dark:from-primary-500 dark:to-primary-400
      text-white font-medium
      shadow-lg shadow-primary-500/30 dark:shadow-primary-900/40
      hover:shadow-xl hover:shadow-primary-500/40 dark:hover:shadow-primary-900/50
      hover:from-primary-700 hover:to-primary-600
      dark:hover:from-primary-600 dark:hover:to-primary-500
      disabled:from-gray-300 disabled:to-gray-300
      dark:disabled:from-gray-700 dark:disabled:to-gray-700
      disabled:shadow-none
    `,
    secondary: `
      bg-gradient-to-r from-secondary-600 to-secondary-500
      dark:from-secondary-500 dark:to-secondary-400
      text-white font-medium
      shadow-lg shadow-secondary-500/30
      hover:shadow-xl hover:shadow-secondary-500/40
      hover:from-secondary-700 hover:to-secondary-600
      dark:hover:from-secondary-600 dark:hover:to-secondary-500
      disabled:from-gray-300 disabled:to-gray-300
      dark:disabled:from-gray-700 dark:disabled:to-gray-700
      disabled:shadow-none
    `,
    outline: `
      bg-transparent
      text-primary-700 dark:text-primary-400
      border-2 border-primary-600 dark:border-primary-500
      hover:bg-primary-50 dark:hover:bg-primary-900/20
      disabled:border-gray-300 dark:disabled:border-gray-700
      disabled:text-gray-400 dark:disabled:text-gray-600
    `,
    ghost: `
      bg-transparent
      text-gray-700 dark:text-gray-300
      hover:bg-gray-100 dark:hover:bg-dark-hover
      disabled:text-gray-400 dark:disabled:text-gray-600
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-500
      dark:from-red-500 dark:to-red-400
      text-white font-medium
      shadow-lg shadow-red-500/30
      hover:shadow-xl hover:shadow-red-500/40
      hover:from-red-700 hover:to-red-600
      dark:hover:from-red-600 dark:hover:to-red-500
      disabled:from-gray-300 disabled:to-gray-300
      dark:disabled:from-gray-700 dark:disabled:to-gray-700
      disabled:shadow-none
    `,
  };

  // Tamanhos
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg min-h-[36px]',
    md: 'px-4 py-2.5 text-sm rounded-xl min-h-[44px]',
    lg: 'px-6 py-3 text-base rounded-xl min-h-[48px]',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        relative inline-flex items-center justify-center gap-2
        ${sizes[size]}
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        transition-all duration-200 ease-out
        active:scale-95
        disabled:cursor-not-allowed disabled:opacity-60
        focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2
        overflow-hidden
        group
        touch-manipulation
        ${className}
      `}
      {...props}
    >
      {/* Efeito shimmer */}
      {!isDisabled && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      )}

      {/* Conteúdo */}
      <span className="relative inline-flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {!loading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </span>
    </button>
  );
};

export default Button;
