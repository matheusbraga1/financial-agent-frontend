import { memo } from 'react';
import PropTypes from 'prop-types';
import { X, PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SidebarTooltip from './SidebarTooltip';

/**
 * Header da Sidebar
 * - Logo e título
 * - Botão collapse (desktop)
 * - Botão close (mobile)
 */
const SidebarHeader = memo(({ isCollapsed, onToggleCollapse, onClose }) => {
  return (
    <div
      className="
        flex-shrink-0 w-full
        px-3 py-3
        bg-gradient-to-b from-white to-gray-50/50 dark:from-dark-card dark:to-dark-bg/50
        backdrop-blur-md
        transition-all duration-500 ease-in-out
      "
    >
      <div
        className={`flex items-center h-10 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {/* Collapse button (desktop only) - alinhado com ícone do Novo Chat */}
        <SidebarTooltip
          content={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          <button
            onClick={onToggleCollapse}
            className="
              hidden lg:flex items-center justify-center
              w-10 h-10
              rounded-lg
              text-gray-900 dark:text-white
              hover:bg-gray-100 dark:hover:bg-dark-hover
              transition-colors duration-300 ease-in-out
              group relative flex-shrink-0
            "
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {isCollapsed ? (
                <PanelLeft className="w-5 h-5 min-w-[20px] min-h-[20px] flex-shrink-0 group-hover:scale-110 transition-transform" />
              ) : (
                <PanelLeftClose className="w-5 h-5 min-w-[20px] min-h-[20px] flex-shrink-0 group-hover:scale-110 transition-transform" />
              )}
            </div>
          </button>
        </SidebarTooltip>

        {/* Logo e título (expandido) */}
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="header-content"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden"
            >
              <div className="w-8 h-8 min-w-[32px] min-h-[32px] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 min-w-[20px] min-h-[20px] flex-shrink-0 text-primary-600 dark:text-primary-400" />
              </div>

              <div className="min-w-0 flex-1 flex flex-col justify-center gap-0.5">
                <h1 className="text-base font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 dark:from-primary-400 dark:via-primary-300 dark:to-primary-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden text-ellipsis">
                  Agente Financial
                </h1>
                <p className="text-[10px] text-secondary-600 dark:text-secondary-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  Assistente Inteligente
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="lg:hidden w-10 h-10 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-all duration-200 flex-shrink-0 flex items-center justify-center"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5 min-w-[20px] min-h-[20px] flex-shrink-0" />
        </button>
      </div>
    </div>
  );
});

SidebarHeader.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onToggleCollapse: PropTypes.func.isRequired,
  onClose: PropTypes.func,
};

SidebarHeader.displayName = 'SidebarHeader';

export default SidebarHeader;
