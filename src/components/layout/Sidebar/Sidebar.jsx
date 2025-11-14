import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { useBreakpoints } from '../../../hooks/useMediaQuery';
import ConversationHistory from '../ConversationHistory/ConversationHistory';
import {
  SidebarHeader,
  SidebarNewConversation,
  SidebarUserMenu,
  SidebarSearch,
  SidebarAbout,
} from './components';
import { useSidebarState, useSidebarKeyboard } from './hooks';

/**
 * Sidebar Refatorada - Versão Premium
 *
 * Melhorias implementadas:
 * - ✅ Componentes quebrados e memoizados
 * - ✅ Hook consolidado de estado (useSidebarState)
 * - ✅ Busca funcional com debounce
 * - ✅ Loading states (logout, navegação)
 * - ✅ Skeleton loading no histórico
 * - ✅ Scroll customizado premium
 * - ✅ Animações com Framer Motion
 * - ✅ Tooltip reutilizável (comportamento ChatGPT/Claude)
 * - ✅ Melhor acessibilidade (ARIA, focus management)
 * - ✅ Performance otimizada
 */
const Sidebar = ({
  isOpen,
  onClose,
  currentSessionId,
  onSelectSession,
  onNewConversation,
}) => {
  const [state, actions] = useSidebarState();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDesktop } = useBreakpoints();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handler: Nova conversa
   */
  const handleNewConversation = useCallback(() => {
    onNewConversation?.();
    if (onClose && isOpen) {
      onClose();
    }
  }, [onNewConversation, onClose, isOpen]);

  // Keyboard shortcuts
  useSidebarKeyboard({
    onNewConversation: handleNewConversation,
    onOpenSearch: actions.openSearch,
    onCloseSearch: actions.closeSearch,
    onCloseUserMenu: actions.closeUserMenu,
    onCloseInfo: actions.closeInfo,
    showSearchModal: state.showSearchModal,
    showUserMenu: state.showUserMenu,
    showInfo: state.showInfo,
  });

  /**
   * Handler: Selecionar sessão
   */
  const handleSelectSession = useCallback(
    (sessionId) => {
      onSelectSession?.(sessionId);
      if (location.pathname !== '/chat') {
        navigate('/chat');
      }
      if (onClose && isOpen) {
        onClose();
      }
    },
    [onSelectSession, location.pathname, navigate, onClose, isOpen]
  );

  /**
   * Handler: Logout com loading state
   */
  const handleLogout = useCallback(async () => {
    actions.closeUserMenu();
    actions.startLogout();

    try {
      await logout();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao fazer logout');
      console.error('Erro no logout:', error);
    } finally {
      actions.endLogout();
    }
  }, [actions, logout, navigate]);

  return (
    <>
      {/* Backdrop mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/70 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isDesktop || isOpen ? 0 : '-100%',
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
        }}
        className={`
          fixed lg:sticky inset-y-0 left-0 z-50
          ${state.isCollapsed ? 'w-16' : 'w-72 sm:w-80 lg:w-72'}
          bg-white dark:bg-dark-card
          border-r border-gray-200 dark:border-dark-border
          flex flex-col
          overflow-hidden
          transition-all duration-300 ease-in-out
          shadow-2xl lg:shadow-none
        `}
        aria-label="Menu lateral"
        role="navigation"
      >
        {/* Header */}
        <SidebarHeader
          isCollapsed={state.isCollapsed}
          onToggleCollapse={actions.toggleCollapse}
          onClose={onClose}
        />

        {/* Nova Conversa */}
        <SidebarNewConversation
          isCollapsed={state.isCollapsed}
          onClick={handleNewConversation}
        />

        {/* Histórico de Conversas */}
        <div className="flex-1 overflow-y-auto sidebar-scroll">
          {isAuthenticated && !state.isCollapsed && (
            <div className="px-4 sm:px-5 lg:px-4 py-2">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Histórico
                </h3>
              </div>

              {/* Conversation History ou Skeleton */}
              <ConversationHistory
                onSelectSession={handleSelectSession}
                currentSessionId={currentSessionId}
              />
            </div>
          )}

          {/* Indicador visual quando colapsado */}
          {isAuthenticated && state.isCollapsed && (
            <div className="flex flex-col items-center gap-2 px-2 py-4">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400"
              />
              <div className="w-1 h-1 rounded-full bg-primary-500/50 dark:bg-primary-500/50" />
              <div className="w-0.5 h-0.5 rounded-full bg-primary-400/30 dark:bg-primary-600/30" />
            </div>
          )}
        </div>

        {/* User Menu (Footer) */}
        <div
          className={`
            flex-shrink-0 ${state.isCollapsed ? 'px-2 py-3' : 'px-4 sm:px-5 lg:px-4 py-3 sm:py-4'}
            border-t border-gray-200 dark:border-dark-border
            bg-gradient-to-t from-gray-50/50 to-transparent dark:from-dark-bg/50
          `}
        >
          <SidebarUserMenu
            user={user}
            isAuthenticated={isAuthenticated}
            isCollapsed={state.isCollapsed}
            showUserMenu={state.showUserMenu}
            onToggleUserMenu={actions.toggleUserMenu}
            onCloseUserMenu={actions.closeUserMenu}
            onLogout={handleLogout}
            onOpenInfo={actions.openInfo}
            isLoggingOut={state.isLoggingOut}
            isOpen={isOpen}
            onClose={onClose}
          />
        </div>
      </motion.aside>

      {/* Search Modal */}
      <SidebarSearch
        isOpen={state.showSearchModal}
        onClose={actions.closeSearch}
        onSelectSession={handleSelectSession}
        currentSessionId={currentSessionId}
        isAuthenticated={isAuthenticated}
      />

      {/* About Modal */}
      <SidebarAbout isOpen={state.showInfo} onClose={actions.closeInfo} />

      {/* ARIA Live Region para anúncios */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {state.isLoggingOut && 'Saindo da conta...'}
        {state.showSearchModal && 'Modal de busca aberto'}
        {state.showInfo && 'Modal sobre o agente aberto'}
      </div>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  currentSessionId: PropTypes.string,
  onSelectSession: PropTypes.func,
  onNewConversation: PropTypes.func,
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;
