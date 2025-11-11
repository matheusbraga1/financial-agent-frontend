import { Menu, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { ThemeToggle } from '../../common';
import logo from '../../../assets/img/financial-logo.png';

const MobileHeader = ({ onToggleSidebar }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="lg:hidden bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-3 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Botão Dashboard - Apenas para usuários autenticados */}
        {isAuthenticated && (
          <button
            onClick={() => navigate('/dashboard')}
            className={`p-2 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover'
            }`}
            aria-label="Dashboard"
            title="Dashboard"
          >
            <Home className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <img
          src={logo}
          alt="Logo Financial"
          className="w-6 h-6 object-contain"
        />
        <h1 className="text-base font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent whitespace-nowrap">
          Agente da Financial
        </h1>
      </div>

      <ThemeToggle />
    </header>
  );
};

export default MobileHeader;
