import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Info,
  X,
  LogOut,
  User,
  LogIn,
  UserPlus,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Search,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import ConversationHistory from "../ConversationHistory/ConversationHistory";

/**
 * Sidebar Moderno Inspirado no Claude
 * - Design minimalista e elegante
 * - Transições suaves e profissionais
 * - Modo colapsado inteligente
 * - Menu dropdown para usuário
 * - Acessibilidade completa
 */
const Sidebar = ({
  isOpen,
  onClose,
  currentSessionId,
  onSelectSession,
  onNewConversation,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const s = localStorage.getItem('sidebar:collapsed');
    return s ? s === '1' : false;
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const animTimeoutRef = useRef(true);

  // UI Otimista - Sem cooldown, criação imediata
  const handleNewConversation = useCallback(() => {
    onNewConversation?.();
    if (onClose && isOpen) {
      onClose();
    }
  }, [onNewConversation, onClose, isOpen]);

  // Fecha menu de usuário ao clicar fora
  useEffect(() => {
    const onKeyDown = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = (e.key || '').toLowerCase();
      if (mod && key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      } else if (mod && key === 'n') {
        e.preventDefault();
        handleNewConversation();
      } else if (key === 'escape' && showSearchModal) {
        setShowSearchModal(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNewConversation, showSearchModal]);

  const handleSelectSession = (sessionId) => {
    onSelectSession?.(sessionId);
    if (location.pathname !== "/chat") {
      navigate("/chat");
    }
    if (onClose && isOpen) {
      onClose();
    }
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate("/login");
  };

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((v) => {
      const next = !v;
      localStorage.setItem('sidebar:collapsed', next ? '1' : '0');
      return next;
    });
  }, []);

  // cleanup on unmount
  useEffect(() => () => {
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
  }, []);

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
        style={{ ['--sb-dur']: '300ms', ['--sb-ease']: 'cubic-bezier(0.22,1,0.36,1)' }}
        className={`
          fixed lg:sticky inset-y-0 left-0 z-50
          ${isCollapsed ? "w-16" : "w-64"}
          bg-white dark:bg-dark-card 
          border-r border-gray-200 dark:border-dark-border
          flex flex-col
          overflow-hidden will-change-[width,transform]
          transition-[width,transform] duration-[var(--sb-dur)] ease-[var(--sb-ease)]
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          shadow-lg lg:shadow-none
        `}
        aria-label="Menu lateral"
      >
        {/* Header da Sidebar - Translúcido com sombra */}
        <div
          className={`flex-shrink-0 ${isCollapsed ? "p-2" : "p-4"} 
          bg-white/95 dark:bg-dark-card/95 backdrop-blur-md 
          border-b border-gray-200/80 dark:border-dark-border/80 shadow-sm
          transition-[padding,background-color,box-shadow] duration-[var(--sb-dur)] ease-[var(--sb-ease)]`}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-12 px-2`}>
            {/* Botão Toggle - Estilo Claude com animação de ícone */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-primary-600 dark:text-primary-400 
                hover:bg-gray-100 dark:hover:bg-dark-hover 
                transition-[background-color,opacity,transform,color] duration-[var(--sb-dur)] ease-[var(--sb-ease)] 
                group relative flex-shrink-0"
              title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
              aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
            >
              {isCollapsed ? (
                <>
                  <PanelLeft className="w-5 h-5 group-hover:opacity-0 transition-opacity absolute" />
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 dark:text-primary-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-5 h-5 group-hover:opacity-0 transition-opacity absolute" />
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-primary-600 dark:text-primary-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Título sem logo */}
            {!isCollapsed && (
              <div className={`flex items-center flex-1 min-w-0
                transition-[opacity,transform,width] duration-[var(--sb-dur)] ease-[var(--sb-ease)]
                ${isCollapsed ? 'opacity-0 -translate-x-1 w-0 overflow-hidden pointer-events-none' : 'opacity-100 translate-x-0 w-auto'}`}>
                <h1 className="text-base font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  Agente da Financial
                </h1>
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

        {/* Botão Nova Conversa - Estilo minimalista */}
        <div className={`flex-shrink-0 ${isCollapsed ? "px-2 py-2" : "px-3 py-2"}`}>
          {!isCollapsed ? (
            <button
              onClick={handleNewConversation}
              className={`
                relative inline-flex items-center gap-2 px-3.5 h-9 rounded-md
                bg-transparent text-gray-800 dark:text-gray-200
                border border-gray-300 dark:border-gray-700
                hover:bg-gray-100 dark:hover:bg-dark-hover
                transition-[background-color,border-color,transform] duration-150 ease-out
                active:scale-[.98] group select-none
              `}
              title="Iniciar nova conversa"
              aria-label="Nova conversa"
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-90" />
              <span className="tracking-tight font-medium">Nova conversa</span>
              <span className="ml-1 hidden sm:inline-flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                <kbd className="border border-gray-300 dark:border-gray-600 rounded px-[3px] py-[1px] leading-none">Ctrl</kbd>
                <kbd className="border border-gray-300 dark:border-gray-600 rounded px-[3px] py-[1px] leading-none">N</kbd>
              </span>
            </button>
          ) : (
            <button
              onClick={handleNewConversation}
              className="
                relative grid place-items-center w-full rounded-lg text-white
                h-10 leading-none  /* ← altura fixa */
                bg-gradient-to-b from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-700
                shadow-sm ring-1 ring-primary-700/30 hover:ring-primary-500/40
                hover:shadow-md hover:brightness-[1.08]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1
                transition-[background-color,box-shadow,filter,opacity] duration-[var(--sb-dur)] ease-[var(--sb-ease)]
                active:scale-[.98] group select-none
              "
              title="Nova conversa"
              aria-label="Nova conversa"
            >
              <MessageSquare className="w-4 h-4 opacity-90" />
              <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                Nova conversa
              </div>
            </button>
          )}
        </div>

        {/* Área de Conteúdo - Sempre presente para empurrar footer para baixo */}
        <div className="flex-1 overflow-y-auto">
          {isAuthenticated && !isCollapsed && (
            <div className="px-3 py-2 transition-[padding,opacity,transform] duration-[var(--sb-dur)] ease-[var(--sb-ease)]">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                Histórico
              </h3>
              <ConversationHistory
                onSelectSession={handleSelectSession}
                currentSessionId={currentSessionId}
              />
            </div>
          )}

          {/* Indicador visual quando colapsado */}
          {isAuthenticated && isCollapsed && (
            <div className="flex items-center justify-center px-2 py-4
                transition-[opacity,transform] duration-[var(--sb-dur)] ease-[var(--sb-ease)]">
              <div className="w-1 h-1 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse" />
            </div>
          )}
        </div>

        {/* Footer da Sidebar - Menu de Usuário */}
        <div
          className={`flex-shrink-0 ${
            isCollapsed ? "px-2 py-3" : "px-3 py-3"
          } border-t border-gray-200 dark:border-dark-border`}
        >
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              {/* Botão de Usuário */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`
                  w-full flex items-center rounded-lg
                  transition-[opacity,transform,background-color,color,box-shadow] duration-[var(--sb-dur)] ease-[var(--sb-ease)]
                  ${isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2"}
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover
                  group relative
                `}
                title={isCollapsed ? user?.name || "Menu" : ""}
                aria-label="Menu do usuário"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() ||
                    user?.email?.[0]?.toUpperCase() ||
                    "U"}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.name || "Usuário"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    <p className="font-medium">{user?.name || "Usuário"}</p>
                    <p className="text-xs opacity-75">{user?.email}</p>
                  </div>
                )}
              </button>

              {/* Menu Dropdown com animação scale */}
              {showUserMenu && !isCollapsed && (
                <div
                  className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-2 z-50 origin-bottom"
                  style={{
                    animation: "scaleIn var(--sb-dur) var(--sb-ease)",
                  }}
                >
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
                      navigate("/dashboard");
                      if (onClose && isOpen) onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Dashboard</span>
                  </button>

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

                  <div className="border-t border-gray-200 dark:border-dark-border my-2" />

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
              {/* Botão de Login para não autenticados */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200
                  ${isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2"}
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover
                  group relative
                `}
                title={isCollapsed ? "Login" : ""}
                aria-label="Login"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-hover flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                {!isCollapsed && (
                  <span className="text-sm font-medium">Login</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Login
                  </div>
                )}
              </button>

              {/* Menu Dropdown para não autenticados com animação scale */}
              {showUserMenu && !isCollapsed && (
                <div
                  className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-gray-200 dark:border-dark-border py-2 z-50 origin-bottom"
                  style={{
                    animation: "scaleIn 150ms ease-out",
                  }}
                >
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/login");
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
                      navigate("/register");
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

      {/* Modal de Busca - Ctrl/Cmd + K */}
      {showSearchModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-start justify-center p-4 pt-20"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-lg shadow-2xl border border-gray-200 dark:border-dark-border max-w-2xl w-full overflow-hidden"
            style={{ animation: "scaleIn 200ms ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-dark-border">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                autoFocus
              />
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-dark-hover px-2 py-1 rounded">
                <span>ESC</span>
              </div>
            </div>

            {/* Conteúdo do Modal - Histórico de conversas */}
            <div className="max-h-96 overflow-y-auto p-2">
              {isAuthenticated ? (
                <ConversationHistory
                  onSelectSession={(sessionId) => {
                    handleSelectSession(sessionId);
                    setShowSearchModal(false);
                  }}
                  currentSessionId={currentSessionId}
                />
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    Faça login para ver seu histórico de conversas
                  </p>
                </div>
              )}
            </div>

            {/* Footer com dica */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-dark-hover border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Atalho: Ctrl/Cmd + K</span>
                <span>Selecione com ↑↓ Enter</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sobre */}
      {showInfo && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-lg shadow-xl border border-gray-200 dark:border-dark-border max-w-md w-full p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Agente da Financial
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Assistente de IA v1.0.0
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Sobre o Agente
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Assistente de IA especializado em responder dúvidas sobre
                  processos, documentos e procedimentos da Financial
                  Imobiliária. Utiliza tecnologia avançada de processamento de
                  linguagem natural para fornecer respostas precisas e
                  contextualizadas.
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
