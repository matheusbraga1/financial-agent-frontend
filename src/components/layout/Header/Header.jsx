import { Home, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { ThemeToggle } from '../../common';
import logo from '../../../assets/img/financial-logo.png';

const Header = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="hidden lg:flex bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border sticky top-0 z-30">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        {/* Lado esquerdo - Logo e navegação */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo Financial"
              className="w-8 h-8 object-contain"
            />
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent whitespace-nowrap">
              Agente da Financial
            </h1>
          </div>

          {/* Navegação - Apenas para usuários autenticados */}
          {isAuthenticated && (
            <nav className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover'
                }`}
                title="Dashboard"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>

              <button
                onClick={() => navigate('/chat')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/chat')
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover'
                }`}
                title="Chat"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-medium">Chat</span>
              </button>
            </nav>
          )}
        </div>

        {/* Lado direito - Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;