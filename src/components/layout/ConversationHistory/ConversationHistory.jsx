import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { chatService } from '../../../features/chat/services';
import { toast } from 'sonner';
import ConversationItem from './ConversationItem';

/**
 * Histórico de Conversas
 * Usa navigate para navegação por rotas
 */
const ConversationHistory = ({
  currentSessionId,
  newSessionData,
  onCloseSidebar,
}) => {
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [hoveredSessionId, setHoveredSessionId] = useState(null);
  const [confirmDeleteSession, setConfirmDeleteSession] = useState(null);
  const [newlyAddedSessionId, setNewlyAddedSessionId] = useState(null);

  const addedSessionIdsRef = useRef(new Set());

  /**
   * Carrega sessões do backend
   */
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.getUserSessions();
      const sessionsArray = response?.sessions || [];

      if (!Array.isArray(sessionsArray)) {
        console.error('getUserSessions não retornou array:', response);
        setSessions([]);
        return;
      }

      setSessions(sessionsArray);

      addedSessionIdsRef.current.clear();
      sessionsArray.forEach(session => {
        if (session?.session_id) {
          addedSessionIdsRef.current.add(session.session_id);
        }
      });
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
      setError('Não foi possível carregar o histórico');
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /**
   * Adiciona nova sessão com typing effect
   */
  useEffect(() => {
    if (!newSessionData?.sessionId) return;

    const { sessionId, firstMessage } = newSessionData;

    if (addedSessionIdsRef.current.has(sessionId)) return;

    addedSessionIdsRef.current.add(sessionId);

    const newSession = {
      session_id: sessionId,
      last_message: firstMessage || 'Nova conversa',
      created_at: new Date().toISOString(),
      message_count: 1,
    };

    setSessions(prev => [newSession, ...prev]);
    setNewlyAddedSessionId(sessionId);

    const timer = setTimeout(() => setNewlyAddedSessionId(null), 3000);
    return () => clearTimeout(timer);
  }, [newSessionData]);

  /**
   * Seleciona sessão - navega por rota
   */
  const handleSelectSession = useCallback((sessionId) => {
    navigate(`/chat/${sessionId}`);
    onCloseSidebar?.();
  }, [navigate, onCloseSidebar]);

  /**
   * Abre modal de confirmação de delete
   */
  const handleDeleteSession = useCallback((sessionId) => {
    setConfirmDeleteSession(sessionId);
  }, []);

  /**
   * Confirma e executa delete
   */
  const confirmDelete = useCallback(async () => {
    const sessionId = confirmDeleteSession;
    if (!sessionId) return;

    setConfirmDeleteSession(null);
    setDeletingSessionId(sessionId);

    try {
      await chatService.deleteSession(sessionId);
      toast.success('Conversa excluída com sucesso');

      setSessions(prev => prev.filter(s => s.session_id !== sessionId));
      addedSessionIdsRef.current.delete(sessionId);

      // Se deletou a sessão atual, navega para /chat
      if (sessionId === currentSessionId) {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Erro ao deletar sessão:', err);
      toast.error('Não foi possível excluir a conversa');
    } finally {
      setDeletingSessionId(null);
    }
  }, [confirmDeleteSession, currentSessionId, navigate]);

  const cancelDelete = useCallback(() => {
    setConfirmDeleteSession(null);
  }, []);

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary-100 dark:border-primary-900/30 border-t-primary-600 dark:border-t-primary-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
          Carregando histórico...
        </p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 flex items-center justify-center mb-4 shadow-lg shadow-red-500/10">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm font-semibold text-red-700 dark:text-red-400 text-center mb-2">
          Erro ao carregar
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-4">
          {error}
        </p>
        <button
          onClick={loadSessions}
          className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/30"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Empty
  if (!sessions || sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-dark-hover dark:to-dark-bg flex items-center justify-center mb-4 shadow-lg">
          <MessageSquare className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Nenhuma conversa ainda
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Inicie uma nova conversa para começar
        </p>
        <div className="flex items-center gap-2 text-xs text-primary-600 dark:text-primary-400">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
          <span>Suas conversas serão salvas automaticamente</span>
        </div>
      </div>
    );
  }

  // Sessions list
  return (
    <>
      <div className="space-y-1.5">
        {sessions.map((session) => {
          if (!session?.session_id) return null;

          const isActive = session.session_id === currentSessionId;
          const isDeleting = deletingSessionId === session.session_id;
          const isHovered = hoveredSessionId === session.session_id;
          const enableTyping = session.session_id === newlyAddedSessionId;

          return (
            <ConversationItem
              key={session.session_id}
              session={session}
              isActive={isActive}
              isDeleting={isDeleting}
              isHovered={isHovered}
              enableTyping={enableTyping}
              onSelect={() => handleSelectSession(session.session_id)}
              onDelete={() => handleDeleteSession(session.session_id)}
              onMouseEnter={() => setHoveredSessionId(session.session_id)}
              onMouseLeave={() => setHoveredSessionId(null)}
            />
          );
        })}
      </div>

      {/* Modal de confirmação */}
      {confirmDeleteSession && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={cancelDelete}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-sm w-full overflow-hidden"
            style={{ animation: 'scaleIn 200ms ease-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Excluir conversa?</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Esta ação não pode ser desfeita. Todos os dados desta conversa serão permanentemente excluídos.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all duration-200 font-medium shadow-lg shadow-red-500/30"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

ConversationHistory.propTypes = {
  currentSessionId: PropTypes.string,
  newSessionData: PropTypes.shape({
    sessionId: PropTypes.string.isRequired,
    firstMessage: PropTypes.string,
  }),
  onCloseSidebar: PropTypes.func,
};

ConversationHistory.defaultProps = {
  currentSessionId: null,
  newSessionData: null,
  onCloseSidebar: null,
};

export default ConversationHistory;