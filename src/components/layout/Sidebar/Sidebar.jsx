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
  PanelLeftClose,
  PanelLeft,
  Home, 
  MessageSquare,
  Sparkles,
  Settings
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import ConversationHistory from '../ConversationHistory/ConversationHistory';
import logo from '../../../assets/img/financial-logo.png';

/**
 * Sidebar Moderno Inspirado no Claude
 * - Design minimalista e elegante
 * - Transições suaves e profissionais
 * - Modo colapsado inteligente
 * - Menu dropdown para usuário
 * - Acessibilidade completa
 */
const Sidebar = ({ isOpen, onClose, currentSessionId, onSelectSession, onNewConversation }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cooldownTimerRef = useRef(null);
  const userMenuRef = useRef(null);
  
  const isActive = (path) => location.pathname === path;

  // Cleanup de timeout
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  // Fecha menu de usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);
  
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
    setShowUserMenu(false);
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
        <div className={`flex-shrink-0 ${isCollapsed ? 'p-2' : 'p-4'} border-b border-gray-200 dark:border-dark-border`}>
          <div className="flex items-center gap-2">
            {/* Botão Toggle - Estilo Claude */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover transition-all duration-200 group relative flex-shrink-0"
              title={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
              aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
            >
              {isCollapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <>
                  <PanelLeftClose className="w-5 h-5 opacity-60 group-hover:opacity-0 transition-opacity absolute" />
                  <PanelLeftClose className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-0.5" />
                </>
              )}
            </button>

            {/* Logo e Título */}
            {!isCollapsed && (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center p-1.5">
                  <img
                    src={logo}
                    alt="Financial"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-base font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  Financial
                </h1>
              </div>
            )}

            {/* Logo quando colapsado */}
            {isCollapsed && (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center p-2 mx-auto">
                <img
                  src={logo}
                  alt="Financial"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Botão fechar mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-md transition-colors flex-shrink-0"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Chat
                </div>
              )}
            </button>
          </div>
        )}

        {/* Botão Nova Conversa */}
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

        {/* Footer da Sidebar - Menu de Usuário */}
        <div className={`flex-shrink-0 ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'} border-t border-gray-200 dark:border-dark-border`}>
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              {/* Botão de Usuário */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200
                  ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'}
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover
                  group relative
                `}
                title={isCollapsed ? user?.name || 'Menu' : ''}
                aria-label="Menu do usuário"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    <p className="font-medium">{user?.name || 'Usuário'}</p>
                    <p className="text-xs opacity-75">{user?.email}</p>
                  </div>
                )}
              </button>

              {/* Menu Dropdown */}
              {showUserMenu && !isCollapsed && (
                <div className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-2 animate-fade-in z-50">
                  {user?.is_admin && (
                    <div className="px-3 py-2 mb-2 border-b border-gray-200 dark:border-dark-border">
                      <div className="flex items-center gap-2 text-xs font-medium text-primary-700 dark:text-primary-400">
                        <Sparkles className="w-3 h-3" />
                        Administrador
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowInfo(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Sobre</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={userMenuRef}>
              {/* Botão de Menu para não autenticados */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200
                  ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2'}
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover
                  group relative
                `}
                title={isCollapsed ? 'Menu' : ''}
                aria-label="Menu"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-hover flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-medium">Menu</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Menu
                  </div>
                )}
              </button>

              {/* Menu Dropdown para não autenticados */}
              {showUserMenu && !isCollapsed && (
                <div className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-2 animate-fade-in z-50">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/login');
                      if (onClose && isOpen) onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <LogIn className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Fazer Login</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/register');
                      if (onClose && isOpen) onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Criar Conta</span>
                  </button>

                  <div className="border-t border-gray-200 dark:border-dark-border my-2" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowInfo(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Sobre</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Modal Sobre */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setShowInfo(false)}>
          <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl border border-gray-200 dark:border-dark-border max-w-md w-full p-6 animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center p-2">
                <img src={logo} alt="Financial" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Financial Imobiliária
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Agente de IA v1.0.0
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Sobre o Agente
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Assistente de IA especializado em responder dúvidas sobre processos, documentos e procedimentos da Financial Imobiliária. Utiliza tecnologia avançada de processamento de linguagem natural para fornecer respostas precisas e contextualizadas.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Recursos
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Respostas baseadas em documentos internos</li>
                  <li>• Histórico de conversas persistente</li>
                  <li>• Feedback para melhoria contínua</li>
                  <li>• Suporte a múltiplos formatos de arquivo</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;