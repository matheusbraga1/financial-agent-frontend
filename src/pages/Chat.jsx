import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import MobileHeader from '../components/layout/MobileHeader/MobileHeader';
import ChatInterface from '../features/chat/ChatInterface';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/common';

/**
 * Página de Chat - Layout Atualizado
 * - Sidebar integrado com navegação
 * - Sem navbar redundante
 * - Design limpo e responsivo
 */
const Chat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [forceNewConversation, setForceNewConversation] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const handleNewConversation = useCallback(() => {
    setCurrentSessionId(null);
    setForceNewConversation(true);
    requestAnimationFrame(() => {
      setForceNewConversation(false);
    });
  }, []);

  const handleSelectSession = useCallback((sessionId) => {
    setCurrentSessionId(sessionId);
  }, []);

  const handleSessionCreated = useCallback((sessionId) => {
    if (sessionId && sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (location.state?.newConversation) {
      handleNewConversation();
      window.history.replaceState({}, document.title);
    }
  }, [location, handleNewConversation]);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg">
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
        {/* Header mobile apenas */}
        <MobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* Theme Toggle - Desktop (canto superior direito) */}
        <div className="hidden lg:block absolute top-4 right-6 z-20">
          <ThemeToggle />
        </div>

        {/* Banner para usuários não autenticados */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Mensagem */}
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Você está usando o chat sem login. Suas conversas{' '}
                    <span className="font-semibold">não serão salvas</span>.
                  </p>
                </div>

                {/* Botões */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-md transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
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