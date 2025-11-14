import { memo } from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import SidebarTooltip from './SidebarTooltip';

/**
 * Botão de Nova Conversa
 * - Modo expandido: botão completo com atalho
 * - Modo colapsado: ícone com tooltip
 */
const SidebarNewConversation = memo(({ isCollapsed, onClick }) => {
  if (isCollapsed) {
    return (
      <div className="px-2 py-3">
        <SidebarTooltip content="Nova conversa">
          <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              relative w-full h-12 grid place-items-center rounded-xl
              bg-gradient-to-br from-primary-600 to-primary-700
              dark:from-primary-500 dark:to-primary-600
              text-white
              shadow-lg shadow-primary-500/30
              hover:shadow-xl hover:shadow-primary-500/40
              transition-all duration-200
              group
            "
            aria-label="Nova conversa"
          >
            <MessageSquare className="w-5 h-5" />
          </motion.button>
        </SidebarTooltip>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-5 lg:px-4 py-3">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="
          relative w-full inline-flex items-center justify-center gap-2
          px-4 py-3 rounded-xl
          bg-gradient-to-r from-primary-600 to-primary-500
          dark:from-primary-500 dark:to-primary-400
          text-white font-medium text-sm
          shadow-lg shadow-primary-500/30 dark:shadow-primary-900/40
          hover:shadow-xl hover:shadow-primary-500/40 dark:hover:shadow-primary-900/50
          hover:from-primary-700 hover:to-primary-600
          dark:hover:from-primary-600 dark:hover:to-primary-500
          transition-all duration-200 ease-out
          group overflow-hidden
          min-h-[44px]
        "
        aria-label="Nova conversa"
      >
        {/* Shine effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span className="tracking-tight">Nova conversa</span>

        {/* Keyboard shortcut (desktop only) */}
        <div className="hidden xl:flex items-center gap-1 ml-auto">
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded border border-white/30">
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded border border-white/30">
            N
          </kbd>
        </div>
      </motion.button>
    </div>
  );
});

SidebarNewConversation.displayName = 'SidebarNewConversation';

export default SidebarNewConversation;
