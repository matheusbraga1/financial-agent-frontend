import { memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  LogOut,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Info,
  ChevronRight,
  Sparkles,
  Loader2,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getDisplayName } from '../../../../utils';
import { useTheme } from '../../../../contexts';
import { UserAvatar } from '../../../common';

/**
 * Menu do usuário (autenticado ou guest)
 * - Memoizado para performance
 * - Animações suaves
 * - Loading state no logout
 * - Click outside para fechar
 */
const SidebarUserMenu = memo(
  ({
    user,
    isAuthenticated,
    isCollapsed,
    showUserMenu,
    onToggleUserMenu,
    onCloseUserMenu,
    onLogout,
    onOpenInfo,
    isLoggingOut,
    isOpen,
    onClose,
  }) => {
    const userMenuRef = useRef(null);
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    // Click outside to close
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
          onCloseUserMenu();
        }
      };

      if (showUserMenu) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [showUserMenu, onCloseUserMenu]);

    const handleNavigate = (path) => {
      onCloseUserMenu();
      navigate(path);
      if (onClose && isOpen) {
        onClose();
      }
    };

    if (isAuthenticated) {
      return (
        <div className="relative" ref={userMenuRef}>
          {/* User button */}
          <motion.button
            onClick={onToggleUserMenu}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className={`
              flex items-center rounded-xl gap-3
              transition-all duration-500 ease-in-out
              py-2.5 overflow-hidden
              ${isCollapsed ? 'w-10' : 'w-full'}
              text-gray-700 dark:text-gray-300
              hover:bg-gray-100 dark:hover:bg-dark-hover
              ${showUserMenu ? 'bg-gray-100 dark:bg-dark-hover' : ''}
              group relative
              min-h-[44px]
            `}
            aria-label="Menu do usuário"
          >
            {/* Avatar do usuário */}
            <UserAvatar
              user={user}
              size="lg"
              className="shadow-lg ring-2 ring-white dark:ring-dark-card transition-transform duration-200 rounded-xl will-change-transform"
            />

            {/* User info (expandido) */}
            <div className={`flex-1 text-left min-w-0 transition-all duration-500 ease-in-out ${isCollapsed ? 'w-0 opacity-0 -ml-3' : 'opacity-100'}`}>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {getDisplayName(user)}
                </p>
                {user?.is_admin && (
                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-[9px] font-bold rounded uppercase tracking-wide shadow-sm">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </motion.button>

          {/* Dropdown menu (expandido) */}
          <AnimatePresence>
            {showUserMenu && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute bottom-full left-3 right-3 mb-3 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border py-2 z-50 overflow-hidden"
              >
                {/* Admin badge */}
                {user?.is_admin && (
                  <div className="px-4 py-3 mb-2 bg-gradient-to-r from-secondary-50 to-secondary-100/50 dark:from-secondary-900/20 dark:to-secondary-800/10 border-b border-secondary-200 dark:border-secondary-800/30">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                      <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                        Administrador
                      </span>
                    </div>
                  </div>
                )}

                {/* Dashboard */}
                <button
                  onClick={() => handleNavigate('/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Dashboard</span>
                </button>

                {/* Documentos (apenas para admins) */}
                {user?.is_admin && (
                  <button
                    onClick={() => handleNavigate('/documents')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Documentos</span>
                  </button>
                )}

                {/* Tema */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                >
                  {isDark ? (
                    <Sun className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                  <span>{isDark ? 'Tema claro' : 'Tema escuro'}</span>
                </button>

                {/* Sobre */}
                <button
                  onClick={() => {
                    onCloseUserMenu();
                    onOpenInfo();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                >
                  <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Sobre</span>
                </button>

                <div className="border-t border-gray-200 dark:border-dark-border my-2" />

                {/* Logout */}
                <button
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Guest user
    return (
      <div className="relative" ref={userMenuRef}>
        {/* Guest button */}
        <motion.button
          onClick={onToggleUserMenu}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className={`
            flex items-center rounded-xl gap-3 transition-all duration-500 ease-in-out
            py-2.5 overflow-hidden
            ${isCollapsed ? 'w-10' : 'w-full'}
            text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover
            ${showUserMenu ? 'bg-gray-100 dark:bg-dark-hover' : ''}
            group relative
            min-h-[44px]
          `}
          aria-label="Login"
        >
          <UserAvatar
            user={null}
            size="lg"
            className="transition-transform duration-200 rounded-xl will-change-transform"
          />

          <span className={`text-sm font-medium transition-all duration-500 ease-in-out ${isCollapsed ? 'w-0 opacity-0 -ml-3' : 'w-auto opacity-100'}`}>
            Fazer login
          </span>
        </motion.button>

        {/* Guest dropdown */}
        <AnimatePresence>
          {showUserMenu && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.98 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute bottom-full left-3 right-3 mb-3 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border py-2 z-50"
            >
              <button
                onClick={() => handleNavigate('/login')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              >
                <LogIn className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Fazer Login</span>
              </button>

              <button
                onClick={() => handleNavigate('/register')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta</span>
              </button>

              <div className="border-t border-gray-200 dark:border-dark-border my-2" />

              {/* Tema */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  <Moon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                )}
                <span>{isDark ? 'Tema claro' : 'Tema escuro'}</span>
              </button>

              <button
                onClick={() => {
                  onCloseUserMenu();
                  onOpenInfo();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              >
                <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Sobre</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SidebarUserMenu.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
    is_admin: PropTypes.bool,
  }),
  isAuthenticated: PropTypes.bool,
  isCollapsed: PropTypes.bool.isRequired,
  showUserMenu: PropTypes.bool.isRequired,
  onToggleUserMenu: PropTypes.func.isRequired,
  onCloseUserMenu: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onOpenInfo: PropTypes.func.isRequired,
  isLoggingOut: PropTypes.bool,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

SidebarUserMenu.displayName = 'SidebarUserMenu';

export default SidebarUserMenu;
