import { Menu } from 'lucide-react';
import { ThemeToggle } from '../../common';
import logo from '../../../assets/img/financial-logo.png';

/**
 * Header Mobile Aprimorado
 * - Design limpo e minimalista
 * - Integrado com sidebar
 * - Theme toggle
 */
const MobileHeader = ({ onToggleSidebar }) => {
  return (
    <header className="lg:hidden bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Botão Menu */}
      <button
        onClick={onToggleSidebar}
        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors active:scale-95"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo e Título Centralizados */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center p-1.5">
          <img
            src={logo}
            alt="Financial"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-base font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-500">
          Financial
        </h1>
      </div>

      {/* Theme Toggle */}
      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default MobileHeader;