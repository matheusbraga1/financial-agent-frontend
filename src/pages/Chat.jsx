import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import MobileHeader from '../components/layout/MobileHeader/MobileHeader';
import Header from '../components/layout/Header/Header';
import ChatInterface from '../features/chat/ChatInterface';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de chat principal
 * - Funciona com ou sem autenticação
 * - Histórico de conversas para usuários autenticados
 * - Sessões não autenticadas não são persistidas
 */
const Chat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [forceNewConversation, setForceNewConversation] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  /**
   * Inicia uma nova conversa
   */
  const handleNewConversation = useCallback(() => {
    setCurrentSessionId(null);
    setForceNewConversation(true);

    // Reset do flag após componente reagir
    // FIX: Usar requestAnimationFrame ao invés de setTimeout para evitar memory leak
    requestAnimationFrame(() => {
      setForceNewConversation(false);
    });
  }, []);

  /**
   * Seleciona uma sessão do histórico
   */
  const handleSelectSession = useCallback((sessionId) => {
    setCurrentSessionId(sessionId);
  }, []);

  /**
   * Callback quando uma nova mensagem cria uma sessão
   */
  const handleSessionCreated = useCallback((sessionId) => {
    if (sessionId && sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId);
    }
  }, [currentSessionId]);

 /**
   * Detecta se deve criar nova conversa ao navegar para /chat
   */
  useEffect(() => {
    if (location.state?.newConversation) {
      handleNewConversation();
      
      // Limpa o state para não repetir ao recarregar
      window.history.replaceState({}, document.title);
    }
  }, [location, handleNewConversation]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewConversation={handleNewConversation}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header mobile */}
        <MobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
        {/* Header desktop */}
        <Header />

        {/* Banner informativo para usuários não autenticados - Responsivo */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
              {/* Mobile: Stack vertical */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
                {/* Mensagem */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                  <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200 leading-snug">
                    Você está usando o chat sem login. Suas conversas{' '}
                    <span className="font-semibold">não serão salvas</span>.
                  </p>
                </div>

                {/* Botões - Responsivos */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-md transition-colors whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Fazer </span>Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors whitespace-nowrap"
                  >
                    <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Criar Conta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interface de chat */}
        <ChatInterface 
          sessionId={currentSessionId}
          forceNewConversation={forceNewConversation}
          onSessionCreated={handleSessionCreated}
        />
      </div>
    </div>
  );
};

export default Chat;
