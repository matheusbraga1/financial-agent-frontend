import { Menu } from 'lucide-react';
import { ThemeToggle } from '../../common';
import logo from '../../../assets/img/financial-logo.png';

const MobileHeader = ({ onToggleSidebar }) => {
  return (
    <header className="lg:hidden bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <button
        onClick={onToggleSidebar}
        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2">
        <img
          src={logo}
          alt="Logo Financial"
          className="w-6 h-6 object-contain"
        />
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">
          Agente da Financial
        </h1>
      </div>

      <ThemeToggle />
    </header>
  );
};

export default MobileHeader;
