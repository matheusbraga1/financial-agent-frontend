import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { chatService } from '../../../features/chat/services';
import { toast } from 'sonner';
import ConversationItem from './ConversationItem';
import HistorySkeleton from '../Sidebar/components/HistorySkeleton';
import {
  getCustomTitle,
  setCustomTitle,
  removeCustomTitle,
  cleanupOrphanedTitles,
} from '../../../services/storage';

/**
 * Conversation History Premium da Financial
 * - Design profissional com cores da marca
 * - Efeito de digitação em novas conversas (estilo ChatGPT/Claude)
 * - Animações e microinterações premium
 * - Totalmente responsivo
 * - Modal de confirmação estilizado
 * - Atualização em tempo real
 *
 * @component
 */
const ConversationHistory = ({
  onSelectSession,
  currentSessionId,
  newSessionData,
}) => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [hoveredSessionId, setHoveredSessionId] = useState(null);
  const [confirmDeleteSession, setConfirmDeleteSession] = useState(null);
  const [newlyAddedSessionId, setNewlyAddedSessionId] = useState(null);
  // Estado para forçar re-render quando títulos customizados mudam
  const [customTitlesVersion, setCustomTitlesVersion] = useState(0);

  // Ref para rastrear sessões já adicionadas (evitar duplicatas)
  const addedSessionIdsRef = useRef(new Set());

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /**
   * Carrega todas as sessões do backend
   * Marca todas como já adicionadas para evitar duplicatas
   * Limpa títulos customizados órfãos
   */
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.getUserSessions();
      // getUserSessions retorna { sessions: Array, total, limit, offset, has_more }
      const sessionsList = response.sessions || [];
      setSessions(sessionsList);

      // Marca todas as sessões carregadas como já adicionadas
      const sessionIds = sessionsList.map(session => session.session_id);
      sessionIds.forEach(id => addedSessionIdsRef.current.add(id));

      // Limpa títulos customizados de sessões que não existem mais
      cleanupOrphanedTitles(sessionIds);
    } catch (err) {
      console.error('Erro ao carregar sessões:', err);
      setError('Não foi possível carregar o histórico');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Adiciona nova sessão ao topo da lista com efeito de digitação
   * Evita duplicatas usando ref
   */
  useEffect(() => {
    if (!newSessionData) return;

    const { sessionId, firstMessage } = newSessionData;

    // Evita adicionar duplicatas
    if (addedSessionIdsRef.current.has(sessionId)) {
      return;
    }

    // Marca como adicionada
    addedSessionIdsRef.current.add(sessionId);

    // Cria objeto de sessão temporário
    const newSession = {
      session_id: sessionId,
      last_message: firstMessage || 'Nova conversa',
      created_at: new Date().toISOString(),
      message_count: 1,
    };

    // Adiciona no topo da lista
    setSessions(prev => [newSession, ...prev]);

    // Marca como recém-adicionada para aplicar efeito de digitação
    setNewlyAddedSessionId(sessionId);

    // Remove flag após 3 segundos (tempo suficiente para digitação completar)
    setTimeout(() => {
      setNewlyAddedSessionId(null);
    }, 3000);
  }, [newSessionData]);

  /**
   * Handler: Deletar sessão
   */
  const handleDeleteSession = useCallback((sessionId) => {
    setConfirmDeleteSession(sessionId);
  }, []);

  /**
   * Confirma e executa deleção de sessão
   */
  const confirmDelete = useCallback(async () => {
    const sessionId = confirmDeleteSession;
    setConfirmDeleteSession(null);
    setDeletingSessionId(sessionId);

    try {
      await chatService.deleteSession(sessionId);
      toast.success('Conversa excluída com sucesso');

      // Remove da lista
      setSessions(prev => prev.filter(s => s.session_id !== sessionId));

      // Remove do Set de controle
      addedSessionIdsRef.current.delete(sessionId);

      // Remove título customizado se existir
      removeCustomTitle(sessionId);

      // Se era a sessão atual, limpa seleção
      if (sessionId === currentSessionId) {
        onSelectSession?.(null);
      }
    } catch (err) {
      console.error('Erro ao deletar sessão:', err);
      toast.error('Não foi possível excluir a conversa');
    } finally {
      setDeletingSessionId(null);
    }
  }, [confirmDeleteSession, currentSessionId, onSelectSession]);

  /**
   * Handler: Renomear sessão (título customizado local)
   * @param {string} sessionId - ID da sessão
   * @param {string|null} newTitle - Novo título (null para remover)
   */
  const handleRenameSession = useCallback((sessionId, newTitle) => {
    if (newTitle) {
      setCustomTitle(sessionId, newTitle);
      toast.success('Título atualizado');
    } else {
      removeCustomTitle(sessionId);
      toast.success('Título restaurado');
    }
    // Força re-render para atualizar os títulos
    setCustomTitlesVersion(v => v + 1);
  }, []);

  // Loading state com skeleton
  if (isLoading) {
    return <HistorySkeleton count={5} />;
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

  // Sessions list premium - usando ConversationItem
  return (
    <>
      <div className="space-y-1.5">
        {sessions.map((session) => {
          // Normaliza IDs para string para garantir comparação consistente
          const sessionId = String(session.session_id || '');
          const isActive = currentSessionId && sessionId === String(currentSessionId);
          const isDeleting = deletingSessionId && sessionId === String(deletingSessionId);
          const isHovered = hoveredSessionId && sessionId === String(hoveredSessionId);
          const enableTyping = newlyAddedSessionId && sessionId === String(newlyAddedSessionId);
          // Obtém título customizado do localStorage (usa customTitlesVersion para reatividade)
          const customTitle = customTitlesVersion >= 0 ? getCustomTitle(sessionId) : null;

          return (
            <ConversationItem
              key={session.session_id}
              session={session}
              customTitle={customTitle}
              isActive={isActive}
              isDeleting={isDeleting}
              isHovered={isHovered}
              enableTyping={enableTyping}
              onSelect={() => onSelectSession?.(session.session_id)}
              onDelete={() => handleDeleteSession(session.session_id)}
              onRename={handleRenameSession}
              onMouseEnter={() => setHoveredSessionId(session.session_id)}
              onMouseLeave={() => setHoveredSessionId(null)}
            />
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

ConversationHistory.propTypes = {
  onSelectSession: PropTypes.func,
  currentSessionId: PropTypes.string,
  newSessionData: PropTypes.shape({
    sessionId: PropTypes.string.isRequired,
    firstMessage: PropTypes.string,
  }),
};

ConversationHistory.defaultProps = {
  onSelectSession: null,
  currentSessionId: null,
  newSessionData: null,
};

export default ConversationHistory;
