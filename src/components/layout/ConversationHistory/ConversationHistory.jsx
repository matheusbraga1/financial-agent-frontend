import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { chatService } from '../../../features/chat/services';
import toast from 'react-hot-toast';

/**
 * Componente de Histórico de Conversas
 * Exibe lista de sessões anteriores do usuário autenticado
 */
const ConversationHistory = ({ onSelectSession, currentSessionId }) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  /**
   * Carrega lista de sessões ao montar
   */
  useEffect(() => {
    loadSessions();
  }, []);

  /**
   * Busca todas as sessões do usuário
   */
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

  /**
   * Deleta uma sessão específica
   */
  const handleDeleteSession = async (sessionId, e) => {
    // Previne que o clique no botão delete selecione a sessão
    e.stopPropagation();

    if (!confirm('Tem certeza que deseja excluir esta conversa?')) {
      return;
    }

    setDeletingSessionId(sessionId);

    try {
      await chatService.deleteSession(sessionId);
      toast.success('Conversa excluída com sucesso');
      
      // Remove da lista local
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));

      // Se a sessão deletada era a atual, limpa a seleção
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

  /**
   * Trunca texto longo sem quebrar palavras
   */
  const truncateText = (text, maxLength = 70) => {
    if (!text || text.trim() === '') return 'Nova conversa';

    // Remove múltiplos espaços
    const cleanText = text.trim().replace(/\s+/g, ' ');

    if (cleanText.length <= maxLength) return cleanText;

    // Trunca no último espaço antes do limite
    const truncated = cleanText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    // Se tem espaço, corta lá; senão corta no limite
    return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
  };

  // Estado de loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Carregando histórico...
        </p>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <p className="text-sm text-red-600 dark:text-red-400 text-center mb-3">
          {error}
        </p>
        <button
          onClick={loadSessions}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Lista vazia
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Nenhuma conversa salva
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Suas conversas aparecerão aqui
        </p>
      </div>
    );
  }

  // Lista de sessões
  return (
    <div className="space-y-1">
      {sessions.map((session) => {
        const isActive = session.session_id === currentSessionId;
        const isDeleting = deletingSessionId === session.session_id;

        return (
          <button
            key={session.session_id}
            onClick={() => !isDeleting && onSelectSession?.(session.session_id)}
            disabled={isDeleting}
            className={`
              w-full text-left px-2.5 py-2.5 rounded-lg transition-all
              ${isActive
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-hover'
              }
              ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              group
            `}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />

              <div className="flex-1 min-w-0">
                <p className="text-sm leading-tight truncate">
                  {truncateText(session.last_message)}
                </p>
              </div>

              {/* Botão deletar - aparece ao hover */}
              <button
                onClick={(e) => handleDeleteSession(session.session_id, e)}
                disabled={isDeleting}
                className="
                  flex-shrink-0 p-1.5 rounded-md transition-all
                  opacity-0 group-hover:opacity-100
                  text-gray-400 hover:text-red-600 dark:hover:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
                title="Excluir"
                aria-label="Excluir conversa"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ConversationHistory;