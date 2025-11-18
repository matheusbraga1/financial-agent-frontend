import { Menu } from 'lucide-react';
import { ThemeToggle } from '../../common';
import logo from '../../../assets/img/financial-logo.png';

/**
 * Mobile Header - Versão Simplificada e Responsiva
 * - Removidos efeitos visuais excessivos
 * - Design clean e profissional
 * - Touch targets adequados (min 44px)
 * - Performance otimizada
 */
const MobileHeader = ({ onToggleSidebar }) => {
  return (
    <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border shadow-sm">
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Botão Menu - Touch-friendly */}
        <button
          onClick={onToggleSidebar}
          className="p-2.5 min-w-[44px] min-h-[44px] text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors active:scale-95 touch-manipulation"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Logo e Título Centralizados */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center p-1.5 shadow-md">
            <img
              src={logo}
              alt="Financial"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-bold text-primary-700 dark:text-primary-400 whitespace-nowrap">
              Financial
            </h1>
            <p className="text-[9px] sm:text-[10px] font-medium text-gray-600 dark:text-gray-400 -mt-0.5 whitespace-nowrap">
              Agente IA
            </p>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center min-w-[44px] justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
