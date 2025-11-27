import { memo, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Tooltip reutilizável para Sidebar
 * - Permanece visível mesmo quando sidebar colapsa (comportamento ChatGPT/Claude)
 * - Usa portal para evitar clipping por overflow
 * - Posicionamento customizável
 * - Animações suaves
 */
const SidebarTooltip = memo(({ content, children, position = 'right', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const showTooltip = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      let top, left;

      if (position === 'right') {
        top = rect.top + rect.height / 2;
        left = rect.right + 12;
      } else if (position === 'left') {
        top = rect.top + rect.height / 2;
        left = rect.left - 12;
      } else {
        top = rect.bottom + 12;
        left = rect.left + rect.width / 2;
      }

      setCoords({ top, left });
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
    } else {
      setIsVisible(true);
    }
  }, [position, delay]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="relative"
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div
          className="fixed px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg pointer-events-none whitespace-nowrap z-[9999] shadow-xl"
          style={{
            top: coords.top,
            left: coords.left,
            transform: position === 'bottom'
              ? 'translateX(-50%)'
              : position === 'left'
                ? 'translate(-100%, -50%)'
                : 'translateY(-50%)',
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className={`
              absolute w-0 h-0
              ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-gray-800' : ''}
              ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-t-transparent border-b-transparent border-l-gray-900 dark:border-l-gray-800' : ''}
              ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-800' : ''}
            `}
          />
        </div>,
        document.body
      )}
    </>
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
