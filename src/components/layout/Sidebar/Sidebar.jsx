import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Info, X, LogOut, User, LogIn, UserPlus, PanelLeftClose, PanelLeft, Home, MessageSquare, Menu } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import ConversationHistory from '../ConversationHistory/ConversationHistory';
import InfoModal from '../Header/InfoModal';
import logo from '../../../assets/img/financial-logo.png';

const Sidebar = ({ isOpen, onClose, currentSessionId, onSelectSession, onNewConversation }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // Estado de colapso
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cooldownTimerRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;
  // FIX: Cleanup de timeout ao desmontar componente
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
      // Callback para o componente pai criar nova conversa
      onNewConversation?.();
      // Fechar sidebar em mobile
      if (onClose && isOpen) {
        onClose();
      }
      // FIX: Armazenar referência do timeout para cleanup
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
    
    // Navegar para chat se não estiver lá
    if (location.pathname !== '/chat') {
      navigate('/chat');
    }
    // Fechar sidebar em mobile
    if (onClose && isOpen) {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar - Colapsável no desktop */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          ${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border
          flex flex-col
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            {/* Logo, título e botão toggle */}
            <div className="flex items-center gap-2 min-w-0">
              {/* Botão Toggle - Desktop only, À ESQUERDA do logo */}
              {!isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden lg:flex p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-md transition-colors group flex-shrink-0"
                  title="Recolher sidebar"
                  aria-label="Recolher sidebar"
                >
                  <PanelLeftClose className="w-5 h-5 group-hover:hidden" />
                  <svg
                    className="w-5 h-5 hidden group-hover:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Logo */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                <img
                  src={logo}
                  alt="Logo Financial"
                  className="w-8 h-8 object-contain"
                />
              </div>

              {/* Título */}
              {!isCollapsed && (
                <h1 className="text-base font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent whitespace-nowrap overflow-hidden text-ellipsis">
                  Financial
                </h1>
              )}

              {/* Botão Toggle quando colapsado - À DIREITA do logo */}
              {isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden lg:flex p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-md transition-colors group flex-shrink-0"
                  title="Expandir sidebar"
                  aria-label="Expandir sidebar"
                >
                  <PanelLeft className="w-5 h-5 group-hover:hidden" />
                  <svg
                    className="w-5 h-5 hidden group-hover:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Botão fechar mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover rounded flex-shrink-0"              
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Botão Nova Conversa */}
          {!isCollapsed ? (
            <button
              onClick={handleNewConversation}
              disabled={isCreatingConversation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-primary-700"
              title="Iniciar uma nova conversa"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Nova Conversa</span>
            </button>
          ) : (
            <button
              onClick={handleNewConversation}
              disabled={isCreatingConversation}
              className="w-full flex items-center justify-center p-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Nova conversa"
              aria-label="Nova conversa"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Histórico de conversas - área principal scrollable */}
        {isAuthenticated && !isCollapsed ? (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
              Histórico
            </h3>
            <ConversationHistory
              onSelectSession={handleSelectSession}
              currentSessionId={currentSessionId}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto" />
        )}

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-border space-y-1">
          {/* Se autenticado: mostra informações do usuário */}
          {isAuthenticated ? (
            <>
              {/* Informações do usuário */}
              {user && !isCollapsed && (
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
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors`}
                title={isCollapsed ? 'Sobre o Agente' : ''}
                aria-label={isCollapsed ? 'Sobre o Agente' : undefined}
              >
                <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && (
                  <div className="text-left">
                    <div className="text-sm font-medium">Sobre o Agente</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</div>
                  </div>
                )}
              </button>

              {/* Botão Logout */}
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors`}
                title={isCollapsed ? 'Sair' : ''}
                aria-label={isCollapsed ? 'Sair' : undefined}
              >
                <LogOut className="w-5 h-5" />
                {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
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
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors`}
                title={isCollapsed ? 'Fazer Login' : ''}
                aria-label={isCollapsed ? 'Fazer Login' : undefined}
              >
                <LogIn className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && <span className="text-sm font-medium">Fazer Login</span>}
              </button>
              <button
                onClick={() => {
                  navigate('/register');
                  if (onClose && isOpen) onClose();
                }}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors`}
                title={isCollapsed ? 'Criar Conta' : ''}
                aria-label={isCollapsed ? 'Criar Conta' : undefined}
              >
                <UserPlus className="w-5 h-5" />
                {!isCollapsed && <span className="text-sm font-medium">Criar Conta</span>}
              </button>
              
              {/* Botão Sobre */}
              <button
                onClick={() => setShowInfo(true)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors mt-2`}
                title={isCollapsed ? 'Sobre o Agente' : ''}
                aria-label={isCollapsed ? 'Sobre o Agente' : undefined}
              >
                <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                {!isCollapsed && (
                  <div className="text-left">
                    <div className="text-sm font-medium">Sobre o Agente</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">v1.0.0</div>
                  </div>
                )}
              </button>
            </>
          )}
          
        </div>
      </aside>
    </>
  );
};

export default Sidebar;