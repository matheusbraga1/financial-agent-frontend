import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
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
 * Sidebar com navegação por rotas
 */
const Sidebar = ({
  isOpen,
  onClose,
  currentSessionId,
  onSelectSession,
  onNewConversation,
  newSessionData,
}) => {
  const [state, actions] = useSidebarState();
  const { user, logout, isAuthenticated } = useAuth();
  const { isDesktop } = useBreakpoints();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Nova conversa - navega para /chat
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
   * Seleciona sessão do search - navega por rota
   */
  const handleSelectSessionFromSearch = useCallback((sessionId) => {
    navigate(`/chat/${sessionId}`);
    actions.closeSearch();
    if (onClose && isOpen) {
      onClose();
    }
  }, [navigate, actions, onClose, isOpen]);

  /**
   * Logout
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

  /**
   * Fecha sidebar (para passar ao ConversationHistory)
   */
  const handleCloseSidebar = useCallback(() => {
    if (onClose && isOpen) {
      onClose();
    }
  }, [onClose, isOpen]);

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
        animate={{ x: isDesktop || isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`
          fixed lg:sticky inset-y-0 left-0 z-50
          ${state.isCollapsed ? 'w-16' : 'w-72 sm:w-80 lg:w-72'}
          bg-white dark:bg-dark-card
          border-r border-gray-200 dark:border-dark-border
          flex flex-col
          overflow-hidden overflow-x-hidden
          transition-all duration-500 ease-in-out
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

        {/* Histórico */}
        <div className={`overflow-hidden mt-4 w-full transition-all duration-500 ease-in-out ${state.isCollapsed ? 'h-0 opacity-0' : 'flex-1 opacity-100'}`}>
          {isAuthenticated && (
            <div className="h-full flex flex-col pl-3 pr-0 py-2 w-full">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-2 flex-shrink-0">
                Seus chats
              </h3>
              <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll w-full pr-2">
                <ConversationHistory
                  currentSessionId={currentSessionId}
                  newSessionData={newSessionData}
                  onSelectSession={onSelectSession}
                  onCloseSidebar={handleCloseSidebar}
                />
              </div>
            </div>
          )}
        </div>

        {/* Spacer - empurra User Menu para o footer quando colapsado */}
        <div className={`transition-all duration-500 ease-in-out ${state.isCollapsed ? 'flex-1' : 'h-0'}`} />

        {/* User Menu */}
        <div className="
          flex-shrink-0 w-full
          px-3 py-3
          border-t border-gray-200 dark:border-dark-border
          bg-gradient-to-t from-gray-50/50 to-transparent dark:from-dark-bg/50
        ">
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
        onSelectSession={handleSelectSessionFromSearch}
        currentSessionId={currentSessionId}
        isAuthenticated={isAuthenticated}
      />

      {/* About Modal */}
      <SidebarAbout isOpen={state.showInfo} onClose={actions.closeInfo} />

      {/* ARIA Live Region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
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
  newSessionData: PropTypes.shape({
    sessionId: PropTypes.string.isRequired,
    firstMessage: PropTypes.string,
  }),
};

Sidebar.displayName = 'Sidebar';

export default Sidebar;