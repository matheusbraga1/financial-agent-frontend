import { memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  LogOut,
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Info,
  ChevronRight,
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SidebarTooltip from './SidebarTooltip';

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
          <SidebarTooltip
            content={
              <div>
                <p className="font-semibold text-sm">{user?.name || 'Usuário'}</p>
                <p className="text-xs opacity-75">{user?.email}</p>
              </div>
            }
          >
            <motion.button
              onClick={onToggleUserMenu}
              whileHover={{ scale: isCollapsed ? 1.05 : 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full flex items-center rounded-xl
                transition-all duration-200
                ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
                text-gray-700 dark:text-gray-300
                hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50
                dark:hover:from-primary-900/10 dark:hover:to-secondary-900/10
                hover:shadow-md
                group relative
                min-h-[44px]
              `}
              aria-label="Menu do usuário"
            >
              {/* Avatar */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 dark:from-primary-500 dark:via-primary-400 dark:to-primary-500 flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0 shadow-lg shadow-primary-500/30 ring-2 ring-white dark:ring-dark-card group-hover:scale-105 transition-transform">
                {user?.name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  'U'}
              </div>

              {/* User info (expandido) */}
              {!isCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.name || 'Usuário'}
                    </p>
                    {user?.is_admin && (
                      <span className="px-1.5 py-0.5 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-[9px] font-bold rounded uppercase tracking-wide shadow-sm">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
              )}

              {/* Chevron (expandido) */}
              {!isCollapsed && (
                <ChevronRight
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-90' : ''
                  }`}
                />
              )}
            </motion.button>
          </SidebarTooltip>

          {/* Dropdown menu (expandido) */}
          <AnimatePresence>
            {showUserMenu && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute bottom-full left-3 right-3 sm:left-4 sm:right-4 lg:left-3 lg:right-3 mb-3 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border py-2 z-50 overflow-hidden"
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
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => handleNavigate('/dashboard')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Dashboard</span>
                </motion.button>

                {/* Documentos (apenas para admins) */}
                {user?.is_admin && (
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => handleNavigate('/documents')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Documentos</span>
                  </motion.button>
                )}

                {/* Sobre */}
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    onCloseUserMenu();
                    onOpenInfo();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                >
                  <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>Sobre</span>
                </motion.button>

                <div className="border-t border-gray-200 dark:border-dark-border my-2" />

                {/* Logout */}
                <motion.button
                  whileHover={{ x: 4 }}
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
                </motion.button>
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
        <SidebarTooltip content="Fazer login">
          <motion.button
            onClick={onToggleUserMenu}
            whileHover={{ scale: isCollapsed ? 1.05 : 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              w-full flex items-center rounded-xl transition-all duration-200
              ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'}
              text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover
              group relative
              min-h-[44px]
            `}
            aria-label="Login"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-dark-hover flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>

            {!isCollapsed && <span className="text-sm font-medium">Fazer login</span>}
          </motion.button>
        </SidebarTooltip>

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
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => handleNavigate('/login')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
              >
                <LogIn className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Fazer Login</span>
              </motion.button>

              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => handleNavigate('/register')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Criar Conta</span>
              </motion.button>

              <div className="border-t border-gray-200 dark:border-dark-border my-2" />

              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => {
                  onCloseUserMenu();
                  onOpenInfo();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
              >
                <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span>Sobre</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SidebarUserMenu.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
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
