import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Info, 
  X, 
  LogOut, 
  User, 
  LogIn, 
  UserPlus, 
  ChevronLeft,
  ChevronRight,
  Home, 
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import ConversationHistory from '../ConversationHistory/ConversationHistory';
import logo from '../../../assets/img/financial-logo.png';

/**
 * Sidebar Moderno Inspirado no Claude
 * - Design minimalista e elegante
 * - Transições suaves
 * - Modo colapsado inteligente (apenas ícones)
 * - Tooltips informativos
 * - Acessibilidade completa
 */
const Sidebar = ({ isOpen, onClose, currentSessionId, onSelectSession, onNewConversation }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cooldownTimerRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;

  // Cleanup de timeout
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);
  
  const handleNewConversation = () => {
    if (!isCreatingConversation) {
      setIsCreatingConversation(true);
      onNewConversation?.();
      if (onClose && isOpen) {
        onClose();
      }
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
      cooldownTimerRef.current = setTimeout(() => {
        setIsCreatingConversation(false);
        cooldownTimerRef.current = null;
      }, 1500);
    }
  };

  const handleSelectSession = (sessionId) => {
    onSelectSession?.(sessionId);
    if (location.pathname !== '/chat') {
      navigate('/chat');
    }
    if (onClose && isOpen) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (onClose && isOpen) {
      onClose();
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Principal */}
      <aside
        className={`
          fixed lg:sticky inset-y-0 left-0 z-50
          ${isCollapsed ? 'w-16' : 'w-64'}
          bg-white dark:bg-dark-card 
          border-r border-gray-200 dark:border-dark-border
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-lg lg:shadow-none
        `}
        aria-label="Menu lateral"
      >
        {/* Header da Sidebar */}
        <div className={`flex-shrink-0 ${isCollapsed ? 'p-3' : 'p-4'} border-b border-gray-200 dark:border-dark-border`}>
          {/* Controles superiores */}
          <div className="flex items-center justify-between mb-3">
            {/* Logo/Ícone e Toggle */}
            {!isCollapsed ? (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Logo */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center p-1.5 flex-shrink-0">
                  <img
                    src={logo}
                    alt="Financial"
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Título */}
                <h1 className="text-base font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  Financial
                </h1>
              </div>
            ) : (
              /* Apenas logo quando colapsado */
              <div className="w-full flex justify-center">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center p-2">
                  <img
                    src={logo}
                    alt="Financial"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Botão fechar mobile */}
            {!isCollapsed && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-md transition-colors flex-shrink-0"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Botão Toggle Desktop - Estilo Claude */}
          <button
            onClick={toggleCollapse}
            className={`
              hidden lg:flex items-center justify-center
              ${isCollapsed ? 'w-full' : 'w-full'}
              p-2 rounded-lg
              text-gray-600 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-dark-hover
              transition-all duration-200
              group
            `}
            title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Recolher</span>
              </>
            )}
          </button>
        </div>

        {/* Navegação Principal */}
        {isAuthenticated && (
          <div className={`flex-shrink-0 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'} border-b border-gray-200 dark:border-dark-border space-y-1`}>
            {/* Dashboard */}
            <button
              onClick={() => handleNavigate('/dashboard')}
              className={`
                w-full flex items-center rounded-lg transition-all duration-200
                ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}
                ${isActive('/dashboard')
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover'
                }
                group relative
              `}
              title={isCollapsed ? 'Dashboard' : ''}
              aria-label="Dashboard"
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">Dashboard</span>
              )}
              {/* Tooltip quando colapsado */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Dashboard
                </div>
              )}
            </button>

            {/* Chat */}
            <button
              onClick={() => handleNavigate('/chat')}
              className={`
                w-full flex items-center rounded-lg transition-all duration-200
                ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'}
                ${isActive('/chat')
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover'
                }
                group relative
              `}
              title={isCollapsed ? 'Chat' : ''}
              aria-label="Chat"
            >
              <MessageSquare className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm font-medium">Chat</span>
              )}
              {/* Tooltip quando colapsado */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Chat
                </div>
              )}
            </button>
          </div>
        )}

        {/* Botão Nova Conversa - Design Claude */}
        <div className={`flex-shrink-0 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>
          <button
            onClick={handleNewConversation}
            disabled={isCreatingConversation}
            className={`
              w-full flex items-center rounded-lg transition-all duration-200
              ${isCollapsed ? 'justify-center p-3' : 'gap-2 px-4 py-2.5 justify-center'}
              bg-primary-600 hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700
              text-white font-medium shadow-sm hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
              group relative
            `}
            title={isCollapsed ? 'Nova conversa' : 'Iniciar nova conversa'}
            aria-label="Nova conversa"
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm">Nova Conversa</span>
            )}
            {/* Tooltip quando colapsado */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Nova Conversa
              </div>
            )}
          </button>
        </div>

        {/* Histórico de conversas - Oculto quando colapsado */}
        {isAuthenticated && !isCollapsed && (
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
              Histórico
            </h3>
            <ConversationHistory
              onSelectSession={handleSelectSession}
              currentSessionId={currentSessionId}
            />
          </div>
        )}

        {/* Indicador visual quando colapsado com histórico */}
        {isAuthenticated && isCollapsed && (
          <div className="flex-1 flex items-center justify-center px-2 py-4">
            <div className="w-1 h-1 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse" />
          </div>
        )}

        {/* Footer da Sidebar */}
        <div className={`flex-shrink-0 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'} border-t border-gray-200 dark:border-dark-border space-y-1`}>
          {isAuthenticated ? (
            <>
              {/* Informações do usuário - Oculto quando colapsado */}
              {!isCollapsed && user && (
                <div className="px-3 py-2 mb-2 rounded-lg bg-gray-50 dark:bg-dark-hover">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  {user.is_admin && (
                    <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 rounded text-xs font-medium text-primary-700 dark:text-primary-400">
                      <Sparkles className="w-3 h-3" />
                      Administrador
                    </div>
                  )}
                </div>
              )}

              {/* Avatar quando colapsado */}
              {isCollapsed && user && (
                <div className="flex justify-center mb-2 group relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    <p className="font-medium">{user.name || 'Usuário'}</p>
                    <p className="text-xs opacity-75">{user.email}</p>
                  </div>
                </div>
              )}

              {/* Botão Sobre */}
              <button
                onClick={() => setShowInfo(true)}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200
                  ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'}
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover
                  group relative
                `}
                title={isCollapsed ? 'Sobre' : ''}
                aria-label="Sobre o Agente"
              >
                <Info className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">Sobre</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</div>
                  </div>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Sobre v1.0.0
                  </div>
                )}
              </button>

              {/* Botão Logout */}
              <button
                onClick={handleLogout}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200
                  ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'}
                  text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                  group relative
                `}
                title={isCollapsed ? 'Sair' : ''}
                aria-label="Sair"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">Sair</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Sair
                  </div>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Botões de login/registro para não autenticados */}
              <button
                onClick={() => {
                  navigate('/login');
                  if (onClose && isOpen) onClose();
                }}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200
                  ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'}
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover
                  group relative
                `}
                title={isCollapsed ? 'Fazer Login' : ''}
                aria-label="Fazer Login"
              >
                <LogIn className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && (
                  <span className="text-sm font-medium">Fazer Login</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Fazer Login
                  </div>
                )}
              </button>

              <button
                onClick={() => {
                  navigate('/register');
                  if (onClose && isOpen) onClose();
                }}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200
                  ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2 justify-center'}
                  bg-primary-600 hover:bg-primary-700 text-white font-medium
                  group relative
                `}
                title={isCollapsed ? 'Criar Conta' : ''}
                aria-label="Criar Conta"
              >
                <UserPlus className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm">Criar Conta</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Criar Conta
                  </div>
                )}
              </button>

              {/* Botão Sobre */}
              <button
                onClick={() => setShowInfo(true)}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200
                  ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'}
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover
                  group relative
                `}
                title={isCollapsed ? 'Sobre' : ''}
                aria-label="Sobre o Agente"
              >
                <Info className="w-5 h-5 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">Sobre</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</div>
                  </div>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Sobre v1.0.0
                  </div>
                )}
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Modal Sobre */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </>
  );
};

export default Sidebar;