import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Info, X, LogIn, UserPlus } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import MobileHeader from '../components/layout/MobileHeader/MobileHeader';
import ChatInterface from '../features/chat/ChatInterface';
import { useAuth } from '../contexts/AuthContext';

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
  const [showGuestBanner, setShowGuestBanner] = useState(() => {
    // Verifica se usuário já fechou o banner antes
    return localStorage.getItem('guestBannerDismissed') !== 'true';
  });

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

  const handleDismissBanner = useCallback(() => {
    setShowGuestBanner(false);
    localStorage.setItem('guestBannerDismissed', 'true');
  }, []);

  useEffect(() => {
    if (location.state?.newConversation) {
      handleNewConversation();
      window.history.replaceState({}, document.title);
    }
  }, [location, handleNewConversation]);

  // Reseta banner quando usuário faz login
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.removeItem('guestBannerDismissed');
      setShowGuestBanner(false);
    }
  }, [isAuthenticated]);

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

        {/* Banner para usuários não autenticados - Dismissível */}
        {!isAuthenticated && showGuestBanner && (
          <div className="relative animate-slide-down">
            <div className="bg-gradient-to-r from-blue-50 via-primary-50/30 to-blue-50 dark:from-blue-900/10 dark:via-primary-900/10 dark:to-blue-900/10 border-b border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-start gap-3">
                  {/* Ícone */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center shadow-sm">
                      <Info className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Modo visitante
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Você está explorando o chat como visitante. Para salvar suas conversas e acessá-las depois, faça login ou crie uma conta.
                    </p>

                    {/* Botões de ação */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to="/login"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30 hover:bg-primary-200 dark:hover:bg-primary-900/50 rounded-lg transition-all duration-200 hover:shadow-md"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Fazer Login
                      </Link>
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 dark:from-primary-500 dark:to-primary-400 dark:hover:from-primary-600 dark:hover:to-primary-500 rounded-lg transition-all duration-200 hover:shadow-md shadow-sm"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Criar Conta Grátis
                      </Link>
                    </div>
                  </div>

                  {/* Botão Fechar */}
                  <button
                    onClick={handleDismissBanner}
                    className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Fechar aviso"
                    title="Fechar aviso"
                  >
                    <X className="w-4 h-4" />
                  </button>
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