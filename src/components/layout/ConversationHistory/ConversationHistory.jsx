import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, AlertCircle, Loader2, Clock } from 'lucide-react';
import { chatService } from '../../../features/chat/services';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Componente de Histórico de Conversas - Design Aprimorado
 * - Design limpo inspirado no Claude
 * - Animações suaves
 * - Feedback visual aprimorado
 */
const ConversationHistory = ({ onSelectSession, currentSessionId }) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [hoveredSessionId, setHoveredSessionId] = useState(null);

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

    if (!confirm('Tem certeza que deseja excluir esta conversa?')) {
      return;
    }

    setDeletingSessionId(sessionId);

    try {
      await chatService.deleteSession(sessionId);
      toast.success('Conversa excluída');
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));

      if (sessionId === currentSessionId) {
        onSelectSession?.(null);
      }
    } catch (err) {
      console.error('Erro ao deletar sessão:', err);
      toast.error('Não foi possível excluir');
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Loader2 className="w-7 h-7 text-primary-600 dark:text-primary-400 animate-spin mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Carregando histórico...
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 text-center mb-3">
          {error}
        </p>
        <button
          onClick={loadSessions}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Empty state
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-hover flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          Nenhuma conversa salva
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Suas conversas aparecerão aqui
        </p>
      </div>
    );
  }

  // Sessions list
  return (
    <div className="space-y-1">
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
              w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200
              ${isActive
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover'
              }
              ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              group relative
            `}
          >
            <div className="flex items-start gap-3">
              {/* Ícone */}
              <div className={`
                flex-shrink-0 mt-0.5
                ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}
              `}>
                <MessageSquare className="w-4 h-4" />
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                {/* Texto da mensagem */}
                <p className="text-sm leading-tight truncate mb-1">
                  {truncateText(session.last_message)}
                </p>
                
                {/* Metadados */}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(session.created_at)}</span>
                  {session.message_count > 0 && (
                    <>
                      <span>•</span>
                      <span>{session.message_count} {session.message_count === 1 ? 'mensagem' : 'mensagens'}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Botão deletar */}
              <button
                onClick={(e) => handleDeleteSession(session.session_id, e)}
                disabled={isDeleting}
                className={`
                  flex-shrink-0 p-1.5 rounded-md transition-all
                  ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}
                  text-gray-400 hover:text-red-600 dark:hover:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title="Excluir"
                aria-label="Excluir conversa"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Indicador visual de conversa ativa */}
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 dark:bg-primary-400 rounded-r-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ConversationHistory;