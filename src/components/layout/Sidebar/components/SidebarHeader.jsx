import { memo } from 'react';
import { X, PanelLeftClose, PanelLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../../../common';
import SidebarTooltip from './SidebarTooltip';

/**
 * Header da Sidebar
 * - Logo e título
 * - Botão collapse (desktop)
 * - Botão close (mobile)
 * - Theme toggle
 */
const SidebarHeader = memo(({ isCollapsed, onToggleCollapse, onClose }) => {
  return (
    <div
      className={`
        flex-shrink-0 ${isCollapsed ? 'p-3' : 'p-4 sm:p-5 lg:p-4'}
        bg-gradient-to-b from-white to-gray-50/50 dark:from-dark-card dark:to-dark-bg/50
        border-b border-gray-200/80 dark:border-dark-border/80
        backdrop-blur-md
        transition-all duration-300
      `}
    >
      <div
        className={`flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between'
        } gap-2 sm:gap-3`}
      >
        {/* Collapse button (desktop only) */}
        <SidebarTooltip
          content={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          <button
            onClick={onToggleCollapse}
            className="
              hidden lg:flex items-center justify-center
              w-9 h-9 rounded-lg
              text-primary-600 dark:text-primary-400
              hover:bg-primary-50 dark:hover:bg-primary-900/20
              hover:text-primary-700 dark:hover:text-primary-300
              transition-all duration-200 ease-out
              group relative flex-shrink-0
              ring-1 ring-transparent hover:ring-primary-200 dark:hover:ring-primary-800
            "
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            <motion.div
              initial={false}
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isCollapsed ? (
                <PanelLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <PanelLeftClose className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </motion.div>
          </button>
        </SidebarTooltip>

        {/* Logo e título (expandido) */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 dark:from-primary-500 dark:via-primary-400 dark:to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0 ring-2 ring-primary-100 dark:ring-primary-900/50">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 dark:from-primary-400 dark:via-primary-300 dark:to-primary-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden text-ellipsis">
                  Agente Financial
                </h1>
                <p className="text-[10px] sm:text-xs text-secondary-600 dark:text-secondary-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  Assistente Inteligente
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Close button (mobile only) */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-all duration-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Theme toggle (expandido) */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 sm:mt-4 flex items-center justify-between px-1"
          >
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Tema
            </span>
            <ThemeToggle />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SidebarHeader.displayName = 'SidebarHeader';

export default SidebarHeader;
