import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Tooltip reutilizável para Sidebar
 * - Permanece visível mesmo quando sidebar colapsa (comportamento ChatGPT/Claude)
 * - Posicionamento customizável
 * - Animações suaves
 */
const SidebarTooltip = memo(({ content, children, position = 'right', delay = 0 }) => {
  return (
    <div className="relative group">
      {children}
      <div
        className={`
          absolute ${position === 'right' ? 'left-full ml-3' : position === 'left' ? 'right-full mr-3' : 'top-full mt-3'}
          ${position === 'right' || position === 'left' ? 'top-1/2 -translate-y-1/2' : 'left-1/2 -translate-x-1/2'}
          px-3 py-2
          bg-gray-900 dark:bg-gray-800
          text-white text-sm
          rounded-lg
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          ${delay > 0 ? `delay-${delay}` : ''}
          pointer-events-none
          whitespace-nowrap
          z-[100]
          shadow-xl
        `}
      >
        {content}
        {/* Arrow */}
        <div
          className={`
            absolute
            ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-800' : ''}
            ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-800' : ''}
            ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-gray-800' : ''}
            border-4 border-transparent
          `}
        />
      </div>
    </div>
  );
});

SidebarTooltip.propTypes = {
  content: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['right', 'left', 'bottom']),
  delay: PropTypes.number,
};

SidebarTooltip.displayName = 'SidebarTooltip';

export default SidebarTooltip;
