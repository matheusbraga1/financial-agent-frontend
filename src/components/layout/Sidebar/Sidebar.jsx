import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Info, X, Home, MessageSquare, LogOut, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import InfoModal from '../Header/InfoModal';
import logo from '../../../assets/img/financial-logo.png';

const Sidebar = ({ isOpen, onClose }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNewConversation = () => {
    if (!isCreatingConversation) {
      setIsCreatingConversation(true);

      // Navega para /chat e força nova conversa
      navigate('/chat', { state: { newConversation: true } });

      // Fechar sidebar em mobile após criar nova conversa
      if (onClose && isOpen) {
        onClose();
      }

      // Cooldown de 1.5 segundos para evitar spam
      setTimeout(() => {
        setIsCreatingConversation(false);
      }, 1500);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img
                  src={logo}
                  alt="Logo Financial"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">
                Agente da Financial
              </h1>
            </div>

            {/* Botão fechar mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover rounded"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Botão Nova Conversa */}
          <button
            onClick={handleNewConversation}
            disabled={isCreatingConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-primary-700"
            title="Iniciar uma nova conversa"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nova Conversa</span>
          </button>
        </div>

        {/* Menu de navegação */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {/* Dashboard - apenas para usuários autenticados */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  navigate('/dashboard');
                  if (onClose && isOpen) onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            )}

            {/* Chat - sempre visível */}
            <button
              onClick={() => {
                navigate('/chat');
                if (onClose && isOpen) onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive('/chat')
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">Chat</span>
            </button>
          </div>

          {/* Histórico - apenas para usuários autenticados */}
          {isAuthenticated && (
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                Histórico
              </h3>
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                Em breve...
              </div>
            </div>
          )}
        </nav>

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-border space-y-1">
          {/* Se autenticado: mostra informações do usuário */}
          {isAuthenticated ? (
            <>
              {/* Informações do usuário */}
              {user && (
                <div className="px-3 py-2 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                      {user.name || 'Usuário'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </div>
                </div>
              )}

              {/* Botão Sobre */}
              <button
                onClick={() => setShowInfo(true)}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
              >
                <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="text-left">
                  <div className="text-sm font-medium">Sobre o Agente</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</div>
                </div>
              </button>

              {/* Botão Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sair</span>
              </button>
            </>
          ) : (
            <>
              {/* Se não autenticado: mostra botões de login/registro */}
              <button
                onClick={() => {
                  navigate('/login');
                  if (onClose && isOpen) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
              >
                <LogIn className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium">Fazer Login</span>
              </button>

              <button
                onClick={() => {
                  navigate('/register');
                  if (onClose && isOpen) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <span className="text-sm font-medium">Criar Conta</span>
              </button>

              {/* Botão Sobre */}
              <button
                onClick={() => setShowInfo(true)}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors mt-2"
              >
                <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div className="text-left">
                  <div className="text-sm font-medium">Sobre o Agente</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</div>
                </div>
              </button>
            </>
          )}
        </div>
      </aside>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </>
  );
};

export default Sidebar;
