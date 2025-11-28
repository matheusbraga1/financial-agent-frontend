import { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Info, X, LogIn, UserPlus } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import MobileHeader from '../components/layout/MobileHeader/MobileHeader';
import ChatInterface from '../features/chat/ChatInterface';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de Chat - Com Rotas Dinâmicas
 * 
 * Rotas:
 * - /chat           → Nova conversa (empty state)
 * - /chat/:sessionId → Conversa específica
 * 
 * Padrão inspirado no Claude/ChatGPT
 */
const Chat = () => {
  // Obtém sessionId da URL (undefined se /chat, string se /chat/:sessionId)
  const { sessionId: urlSessionId } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showGuestBanner, setShowGuestBanner] = useState(() => {
    return localStorage.getItem('guestBannerDismissed') !== 'true';
  });
  const [newSessionData, setNewSessionData] = useState(null);

  // Key para controlar remontagem - independente da URL
  // Só muda quando usuário explicitamente inicia nova conversa ou troca de conversa
  const [conversationKey, setConversationKey] = useState(() => Date.now());

  // Índice para alternar textos de saudação no EmptyState
  const [greetingIndex, setGreetingIndex] = useState(0);

  const { isAuthenticated, user } = useAuth();

  // Ref para rastrear primeira mensagem da sessão (para typing effect no sidebar)
  const sessionFirstMessageRef = useRef(new Map());

  /**
   * Handler: Nova conversa
   * Navega para /chat (sem sessionId) e gera nova key para forçar remontagem
   */
  const handleNewConversation = useCallback(() => {
    // Limpa dados de nova sessão
    setNewSessionData(null);

    // Gera nova key para forçar remontagem (nova conversa)
    setConversationKey(Date.now());

    // Se já está em /chat, apenas atualiza saudação
    if (!urlSessionId) {
      setGreetingIndex(prev => prev + 1);
      setIsSidebarOpen(false);
      return;
    }

    // Navega para /chat (nova conversa)
    navigate('/chat');
    // Fecha sidebar em mobile
    setIsSidebarOpen(false);
  }, [navigate, urlSessionId]);

  /**
   * Handler: Selecionar sessão existente
   * Navega para /chat/:sessionId e gera nova key para forçar remontagem
   */
  const handleSelectSession = useCallback((sessionId) => {
    if (!sessionId) {
      navigate('/chat');
      setConversationKey(Date.now());
      return;
    }

    // Se já estamos nessa conversa, apenas fecha sidebar
    if (urlSessionId === sessionId) {
      setIsSidebarOpen(false);
      return;
    }

    // Gera nova key para forçar remontagem (conversa diferente)
    setConversationKey(Date.now());
    // Navega para a conversa específica
    navigate(`/chat/${sessionId}`);
    // Fecha sidebar em mobile
    setIsSidebarOpen(false);
  }, [navigate, urlSessionId]);

  /**
   * Handler: Sessão criada pelo backend
   *
   * Chamado quando o backend retorna o sessionId real via SSE.
   * Navega de /chat para /chat/sessionId após receber o ID e
   * notifica o histórico se for uma nova conversa.
   */
  const handleSessionCreated = useCallback((sessionId, firstMessage = null) => {
    if (!sessionId) return;

    // Se já está na URL correta, não faz nada
    if (urlSessionId === sessionId) return;

    // Se é uma nova conversa (estava em /chat), notifica o histórico
    if (!urlSessionId && firstMessage) {
      // Evita duplicatas
      if (!sessionFirstMessageRef.current.has(sessionId)) {
        sessionFirstMessageRef.current.set(sessionId, firstMessage);

        // Limpa sessões antigas (mantém últimas 50)
        if (sessionFirstMessageRef.current.size > 50) {
          const keys = Array.from(sessionFirstMessageRef.current.keys());
          keys.slice(0, keys.length - 50).forEach(key => {
            sessionFirstMessageRef.current.delete(key);
          });
        }

        // Notifica sidebar
        setNewSessionData({ sessionId, firstMessage });

        // Limpa após animação
        setTimeout(() => setNewSessionData(null), 3500);
      }
    }

    // Navega para a URL com sessionId (replace para não poluir histórico)
    // conversationKey permanece inalterado, não há remontagem do ChatInterface
    navigate(`/chat/${sessionId}`, { replace: true });
  }, [navigate, urlSessionId]);

  /**
   * Handler: Captura primeira mensagem de nova sessão
   * DEPRECADO: Agora handleSessionCreated gerencia isso
   * Mantido para compatibilidade com ChatInterface
   */
  const handleFirstMessage = useCallback((sessionId, message) => {
    // Armazena para uso posterior quando handleSessionCreated for chamado
    if (!sessionId || !message) return;
    if (sessionFirstMessageRef.current.has(sessionId)) return;

    sessionFirstMessageRef.current.set(sessionId, message);
  }, []);

  /**
   * Handler: Dismiss banner de visitante
   */
  const handleDismissBanner = useCallback(() => {
    setShowGuestBanner(false);
    localStorage.setItem('guestBannerDismissed', 'true');
  }, []);

  /**
   * Reset banner quando usuário faz login
   */
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
        currentSessionId={urlSessionId || null}
        onSelectSession={handleSelectSession}
        onNewConversation={handleNewConversation}
        newSessionData={newSessionData}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header mobile */}
        <MobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* Banner para usuários não autenticados */}
        {!isAuthenticated && showGuestBanner && (
          <div className="relative animate-slide-down">
            <div className="bg-gradient-to-r from-blue-50 via-primary-50/30 to-blue-50 dark:from-blue-900/10 dark:via-primary-900/10 dark:to-blue-900/10 border-b border-blue-200/50 dark:border-blue-800/30 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 flex items-center justify-center shadow-sm">
                      <Info className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Modo visitante
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Você está explorando o chat como visitante. Para salvar suas conversas e acessá-las depois, faça login ou crie uma conta.
                    </p>

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

        {/* Interface de chat - key força remontagem apenas quando troca de conversa */}
        <ChatInterface
          key={conversationKey}
          sessionId={urlSessionId || null}
          greetingIndex={greetingIndex}
          userName={user?.username || user?.email || null}
          onSessionCreated={handleSessionCreated}
          onFirstMessage={handleFirstMessage}
        />
      </div>
    </div>
  );
};

export default Chat;