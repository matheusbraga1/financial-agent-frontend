import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, AlertCircle, Loader2, Clock, ChevronRight } from 'lucide-react';
import { chatService } from '../../../features/chat/services';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Conversation History Premium da Financial
 * - Design profissional com cores da marca
 * - Verde #00884f e Dourado #bf9c4b
 * - Animações e microinterações premium
 * - Totalmente responsivo
 * - Modal de confirmação estilizado
 */
const ConversationHistory = ({ onSelectSession, currentSessionId }) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [hoveredSessionId, setHoveredSessionId] = useState(null);
  const [confirmDeleteSession, setConfirmDeleteSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await chatService.getUserSessions();
      setSessions(data);
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
      setError('Não foi possível carregar o histórico');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    setConfirmDeleteSession(sessionId);
  };

  const confirmDelete = async () => {
    const sessionId = confirmDeleteSession;
    setConfirmDeleteSession(null);
    setDeletingSessionId(sessionId);

    try {
      await chatService.deleteSession(sessionId);
      toast.success('Conversa excluída com sucesso', {
        icon: '✓',
        style: {
          background: '#00884f',
          color: '#fff',
        },
      });
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));

      if (sessionId === currentSessionId) {
        onSelectSession?.(null);
      }
    } catch (err) {
      console.error('Erro ao deletar sessão:', err);
      toast.error('Não foi possível excluir a conversa');
    } finally {
      setDeletingSessionId(null);
    }
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text || text.trim() === '') return 'Nova conversa';
    const cleanText = text.trim().replace(/\s+/g, ' ');
    if (cleanText.length <= maxLength) return cleanText;
    const truncated = cleanText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
  };

  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return '';
    }
  };

  // Loading state premium
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
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Aguarde um momento
        </p>
      </div>
    );
  }

  // Error state premium
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
          className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-500 transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Empty state premium
  if (sessions.length === 0) {
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
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400 animate-pulse" />
          <span>Suas conversas serão salvas automaticamente</span>
        </div>
      </div>
    );
  }

  // Sessions list premium
  return (
    <>
      <div className="space-y-1.5">
        {sessions.map((session) => {
          const isActive = session.session_id === currentSessionId;
          const isDeleting = deletingSessionId === session.session_id;
          const isHovered = hoveredSessionId === session.session_id;

          return (
            <button
              key={session.session_id}
              onClick={() => !isDeleting && onSelectSession?.(session.session_id)}
              onMouseEnter={() => setHoveredSessionId(session.session_id)}
              onMouseLeave={() => setHoveredSessionId(null)}
              disabled={isDeleting}
              className={`
                w-full text-left px-3 py-3 rounded-xl
                transition-all duration-200 ease-out
                ${isActive
                  ? 'bg-gradient-to-r from-primary-50 to-secondary-50/30 dark:from-primary-900/20 dark:to-secondary-900/10 text-primary-800 dark:text-primary-200 shadow-sm ring-1 ring-primary-200 dark:ring-primary-800'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover hover:shadow-sm'
                }
                ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}
                group relative overflow-hidden
                min-h-[44px]
              `}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 dark:from-primary-400/10 dark:to-secondary-400/10 pointer-events-none" />
              )}

              <div className="relative flex items-start gap-3">
                <div className={`
                  flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-br from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white shadow-md shadow-primary-500/30'
                    : 'bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                  }
                `}>
                  <MessageSquare className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug mb-1.5 font-medium ${isActive ? 'text-primary-900 dark:text-primary-100' : ''}`}>
                    {truncateText(session.last_message)}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
                      <Clock className="w-3 h-3" />
                      <span>{formatTimestamp(session.created_at)}</span>
                    </div>
                    {session.message_count > 0 && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className={`flex items-center gap-1 ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          <MessageSquare className="w-3 h-3" />
                          <span>{session.message_count}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center gap-1">
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-primary-600 dark:text-primary-400 animate-pulse" />
                  )}
                  <button
                    onClick={(e) => handleDeleteSession(session.session_id, e)}
                    disabled={isDeleting}
                    className={`
                      p-1.5 rounded-lg transition-all duration-200
                      ${(isHovered || isActive) && !isDeleting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
                      text-gray-400 hover:text-red-600 dark:hover:text-red-400
                      hover:bg-red-50 dark:hover:bg-red-900/20
                      disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110
                    `}
                    title="Excluir"
                    aria-label="Excluir conversa"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-primary-600 via-primary-500 to-primary-600 dark:from-primary-500 dark:via-primary-400 dark:to-primary-500 rounded-r-full shadow-lg shadow-primary-500/50" />
              )}
            </button>
          );
        })}
      </div>

      {confirmDeleteSession && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmDeleteSession(null)}
        >
          <div
            className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-sm w-full overflow-hidden"
            style={{ animation: "scaleIn 200ms ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-600 to-red-500 dark:from-red-500 dark:to-red-400 p-6 text-white">
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
                  onClick={() => setConfirmDeleteSession(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 dark:from-red-500 dark:to-red-400 text-white rounded-xl hover:from-red-700 hover:to-red-600 dark:hover:from-red-600 dark:hover:to-red-500 transition-all duration-200 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
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

export default ConversationHistory;
