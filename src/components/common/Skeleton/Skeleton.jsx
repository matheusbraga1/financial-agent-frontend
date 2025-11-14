/**
 * Skeleton Premium da Financial
 * Componente de loading skeleton para estados de carregamento
 * - Animação suave
 * - Variantes customizáveis
 *
 * @param {'text'|'circle'|'rectangle'|'card'} variant
 * @param {string} width - Largura customizada
 * @param {string} height - Altura customizada
 * @param {number} count - Número de linhas (para variant text)
 */
const Skeleton = ({
  variant = 'text',
  width = '100%',
  height,
  count = 1,
  className = '',
  ...props
}) => {
  const baseClasses = `
    bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200
    dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
    animate-pulse
    bg-[length:200%_100%]
  `;

  const variants = {
    text: 'h-4 rounded-md',
    circle: 'rounded-full aspect-square',
    rectangle: 'rounded-lg',
    card: 'rounded-xl',
  };

  // Para múltiplas linhas de texto
  if (variant === 'text' && count > 1) {
    return (
      <div className="space-y-2">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variants.text} ${className}`}
            style={{
              width: i === count - 1 ? '80%' : width,
              height: height,
            }}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={{ width, height }}
      {...props}
    />
  );
};

/**
 * Skeleton pré-definidos para casos comuns
 */
export const SkeletonAvatar = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return <Skeleton variant="circle" className={sizes[size]} />;
};

export const SkeletonText = ({ lines = 3 }) => {
  return <Skeleton variant="text" count={lines} />;
};

export const SkeletonCard = () => {
  return (
    <div className="bg-white dark:bg-dark-card rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-dark-border">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" className="mb-2" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
};

export const SkeletonMessage = () => {
  return (
    <div className="flex gap-3 p-4">
      <SkeletonAvatar />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="30%" />
        <Skeleton variant="text" count={2} />
      </div>
    </div>
  );
};

export default Skeleton;
