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
  Clock,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import ConversationHistory from "../ConversationHistory/ConversationHistory";
import { ThemeToggle } from "../../common";

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
  const sidebarRef = useRef(null);

  const handleNewConversation = useCallback(() => {
    onNewConversation?.();
    if (onClose && isOpen) {
      onClose();
    }
  }, [onNewConversation, onClose, isOpen]);

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
      } else if (key === 'escape') {
        if (showSearchModal) {
          setShowSearchModal(false);
        } else if (showUserMenu) {
          setShowUserMenu(false);
        } else if (showInfo) {
          setShowInfo(false);
        }
      }
    };
    
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNewConversation, showSearchModal, showUserMenu, showInfo]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

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

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/70 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed lg:sticky inset-y-0 left-0 z-50
          ${isCollapsed ? "w-16" : "w-72 sm:w-80 lg:w-72"}
          bg-white dark:bg-dark-card 
          border-r border-gray-200 dark:border-dark-border
          flex flex-col
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          shadow-2xl lg:shadow-none
        `}
        aria-label="Menu lateral"
      >
        <div className={`
          flex-shrink-0 ${isCollapsed ? "p-3" : "p-4 sm:p-5 lg:p-4"}
          bg-gradient-to-b from-white to-gray-50/50 dark:from-dark-card dark:to-dark-bg/50
          border-b border-gray-200/80 dark:border-dark-border/80 
          backdrop-blur-md
          transition-all duration-300
        `}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2 sm:gap-3`}>
            <button
              onClick={toggleCollapse}
              className="
                hidden lg:flex items-center justify-center 
                w-9 h-9 rounded-lg 
                text-primary-600 dark:text-primary-400 
                hover:bg-primary-50 dark:hover:bg-primary-900/20
                hover:text-primary-700 dark:hover:text-primary-300
                transition-all duration-200 ease-out 
                group relative flex-shrink-0
                ring-1 ring-transparent hover:ring-primary-200 dark:hover:ring-primary-800
              "
              title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
              aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
            >
              {isCollapsed ? (
                <PanelLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
              ) : (
                <PanelLeftClose className="w-5 h-5 group-hover:scale-110 transition-transform" />
              )}
            </button>

            {!isCollapsed && (
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 dark:from-primary-500 dark:via-primary-400 dark:to-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0 ring-2 ring-primary-100 dark:ring-primary-900/50">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 dark:from-primary-400 dark:via-primary-300 dark:to-primary-400 bg-clip-text text-transparent whitespace-nowrap overflow-hidden text-ellipsis">
                    Agente Financial
                  </h1>
                  <p className="text-[10px] sm:text-xs text-secondary-600 dark:text-secondary-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    Assistente Inteligente
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-all duration-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isCollapsed && (
            <div className="mt-3 sm:mt-4 flex items-center justify-between px-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Tema
              </span>
              <ThemeToggle />
            </div>
          )}
        </div>

        <div className={`flex-shrink-0 ${isCollapsed ? "px-2 py-3" : "px-4 sm:px-5 lg:px-4 py-3"}`}>
          {!isCollapsed ? (
            <button
              onClick={handleNewConversation}
              className="
                relative w-full inline-flex items-center justify-center gap-2 
                px-4 py-3 rounded-xl
                bg-gradient-to-r from-primary-600 to-primary-500 
                dark:from-primary-500 dark:to-primary-400
                text-white font-medium text-sm
                shadow-lg shadow-primary-500/30 dark:shadow-primary-900/40
                hover:shadow-xl hover:shadow-primary-500/40 dark:hover:shadow-primary-900/50
                hover:from-primary-700 hover:to-primary-600
                dark:hover:from-primary-600 dark:hover:to-primary-500
                transition-all duration-200 ease-out
                active:scale-[0.98]
                group overflow-hidden
                min-h-[44px]
              "
              title="Iniciar nova conversa"
              aria-label="Nova conversa"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="tracking-tight">Nova conversa</span>
              
              <div className="hidden xl:flex items-center gap-1 ml-auto">
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded border border-white/30">⌘</kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded border border-white/30">N</kbd>
              </div>
            </button>
          ) : (
            <button
              onClick={handleNewConversation}
              className="
                relative w-full h-12 grid place-items-center rounded-xl
                bg-gradient-to-br from-primary-600 to-primary-700 
                dark:from-primary-500 dark:to-primary-600
                text-white
                shadow-lg shadow-primary-500/30
                hover:shadow-xl hover:shadow-primary-500/40
                hover:scale-105
                transition-all duration-200
                active:scale-95
                group
              "
              title="Nova conversa"
              aria-label="Nova conversa"
            >
              <MessageSquare className="w-5 h-5" />
              
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                Nova conversa
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800" />
              </div>
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto sidebar-scroll">
          {isAuthenticated && !isCollapsed && (
            <div className="px-4 sm:px-5 lg:px-4 py-2">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Histórico
                </h3>
              </div>
              <ConversationHistory
                onSelectSession={handleSelectSession}
                currentSessionId={currentSessionId}
              />
            </div>
          )}

          {isAuthenticated && isCollapsed && (
            <div className="flex flex-col items-center gap-2 px-2 py-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-primary-500/50 dark:bg-primary-500/50" />
              <div className="w-0.5 h-0.5 rounded-full bg-primary-400/30 dark:bg-primary-600/30" />
            </div>
          )}
        </div>

        <div className={`
          flex-shrink-0 ${isCollapsed ? "px-2 py-3" : "px-4 sm:px-5 lg:px-4 py-3 sm:py-4"}
          border-t border-gray-200 dark:border-dark-border
          bg-gradient-to-t from-gray-50/50 to-transparent dark:from-dark-bg/50
        `}>
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`
                  w-full flex items-center rounded-xl
                  transition-all duration-200
                  ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"}
                  text-gray-700 dark:text-gray-300 
                  hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50
                  dark:hover:from-primary-900/10 dark:hover:to-secondary-900/10
                  hover:shadow-md
                  group relative
                  min-h-[44px]
                `}
                title={isCollapsed ? user?.name || "Menu" : ""}
                aria-label="Menu do usuário"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 dark:from-primary-500 dark:via-primary-400 dark:to-primary-500 flex items-center justify-center text-white text-sm sm:text-base font-bold flex-shrink-0 shadow-lg shadow-primary-500/30 ring-2 ring-white dark:ring-dark-card group-hover:scale-105 transition-transform">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name || "Usuário"}
                      </p>
                      {user?.is_admin && (
                        <span className="px-1.5 py-0.5 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-[9px] font-bold rounded uppercase tracking-wide shadow-sm">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                )}
                
                {!isCollapsed && (
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-90' : ''}`} />
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    <p className="font-semibold text-sm">{user?.name || "Usuário"}</p>
                    <p className="text-xs opacity-75">{user?.email}</p>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800" />
                  </div>
                )}
              </button>

              {showUserMenu && !isCollapsed && (
                <div
                  className="absolute bottom-full left-3 right-3 sm:left-4 sm:right-4 lg:left-3 lg:right-3 mb-3 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border py-2 z-50 overflow-hidden"
                  style={{ animation: "scaleIn 200ms ease-out" }}
                >
                  {user?.is_admin && (
                    <div className="px-4 py-3 mb-2 bg-gradient-to-r from-secondary-50 to-secondary-100/50 dark:from-secondary-900/20 dark:to-secondary-800/10 border-b border-secondary-200 dark:border-secondary-800/30">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                        <span className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                          Administrador
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/dashboard");
                      if (onClose && isOpen) onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowInfo(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                  >
                    <Info className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Sobre</span>
                  </button>

                  <div className="border-t border-gray-200 dark:border-dark-border my-2" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`
                  w-full flex items-center rounded-xl transition-all duration-200
                  ${isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"}
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover
                  group relative
                  min-h-[44px]
                `}
                title={isCollapsed ? "Login" : ""}
                aria-label="Login"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-dark-hover flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                
                {!isCollapsed && (
                  <span className="text-sm font-medium">Fazer login</span>
                )}
                
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    Fazer login
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-gray-800" />
                  </div>
                )}
              </button>

              {showUserMenu && !isCollapsed && (
                <div
                  className="absolute bottom-full left-3 right-3 mb-3 bg-white dark:bg-dark-card rounded-xl shadow-2xl border border-gray-200 dark:border-dark-border py-2 z-50"
                  style={{ animation: "scaleIn 200ms ease-out" }}
                >
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/login");
                      if (onClose && isOpen) onClose();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
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
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
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
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
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

      {showSearchModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-start justify-center p-4 pt-16 sm:pt-20 animate-fade-in"
          onClick={() => setShowSearchModal(false)}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-2xl w-full overflow-hidden"
            style={{ animation: "scaleIn 200ms ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-gray-50/50 to-transparent dark:from-dark-bg/50">
              <Search className="w-5 h-5 text-primary-500 dark:text-primary-400" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                autoFocus
              />
              <kbd className="hidden sm:flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-hover px-2 py-1 rounded-md border border-gray-200 dark:border-dark-border">
                ESC
              </kbd>
            </div>

            <div className="max-h-96 overflow-y-auto p-3">
              {isAuthenticated ? (
                <ConversationHistory
                  onSelectSession={(sessionId) => {
                    handleSelectSession(sessionId);
                    setShowSearchModal(false);
                  }}
                  currentSessionId={currentSessionId}
                />
              ) : (
                <div className="p-8 sm:p-12 text-center text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 opacity-30" />
                  <p className="text-sm sm:text-base font-medium mb-2">
                    Faça login para ver seu histórico
                  </p>
                  <p className="text-xs sm:text-sm opacity-75">
                    Suas conversas são salvas automaticamente
                  </p>
                </div>
              )}
            </div>

            <div className="px-4 sm:px-5 py-3 bg-gray-50 dark:bg-dark-hover border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="hidden sm:inline">Atalho: ⌘K ou Ctrl+K</span>
                <span className="sm:hidden">⌘K</span>
                <span className="hidden sm:inline">Navegue com ↑↓ Enter</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInfo && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-md w-full overflow-hidden"
            style={{ animation: "scaleIn 200ms ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 dark:from-primary-500 dark:via-primary-400 dark:to-primary-500 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    Agente Financial
                  </h3>
                  <p className="text-sm text-white/80">
                    Versão 1.0.0
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary-600 dark:text-primary-400" />
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
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Recursos
                </h4>
                <ul className="space-y-2">
                  {[
                    "Respostas baseadas em documentos internos",
                    "Histórico de conversas persistente",
                    "Feedback para melhoria contínua",
                    "Suporte a múltiplos formatos de arquivo"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setShowInfo(false)}
                className="w-full px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 dark:from-primary-500 dark:to-primary-400 dark:hover:from-primary-600 dark:hover:to-primary-500 text-white rounded-xl transition-all duration-200 font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
