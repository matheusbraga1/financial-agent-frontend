import { useState } from 'react';

/**
 * Tooltip Premium da Financial
 * Componente de tooltip acessível e estilizado
 *
 * @param {ReactNode} children - Elemento que ativa o tooltip
 * @param {string} content - Conteúdo do tooltip
 * @param {'top'|'bottom'|'left'|'right'} position - Posição do tooltip
 * @param {number} delay - Delay para mostrar (ms)
 */
const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 300,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  // Posições do tooltip
  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Setas do tooltip
  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-gray-700',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-700',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700',
  };

  if (!content) return children;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      {...props}
    >
      {children}

      {isVisible && (
        <div
          className={`
            absolute ${positions[position]}
            px-3 py-2
            bg-gray-900 dark:bg-gray-700
            text-white text-sm
            rounded-lg
            shadow-xl
            whitespace-nowrap
            z-50
            pointer-events-none
            animate-fade-in
            ${className}
          `}
          role="tooltip"
        >
          {content}

          {/* Seta */}
          <div
            className={`
              absolute ${arrows[position]}
              border-4 border-transparent
            `}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
