import { memo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, Trash2, Loader2, Clock, ChevronRight, Pencil, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTypingEffectWithTruncate } from '../../../hooks';

/**
 * Item individual de conversa no histórico
 * - Com efeito de digitação opcional
 * - Design premium com animações
 * - Suporte a edição de título inline
 * - Totalmente acessível
 *
 * @component
 */
const ConversationItem = memo(({
  session,
  customTitle,
  isActive,
  isDeleting,
  isHovered,
  enableTyping,
  onSelect,
  onDelete,
  onRename,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  // Garante valores padrão seguros para campos do session
  const safeSession = {
    session_id: session.session_id || '',
    last_message: session.last_message || 'Nova conversa',
    created_at: session.created_at || new Date().toISOString(),
    message_count: session.message_count || 0,
  };

  // Título para exibição: customTitle tem prioridade sobre last_message
  const displayTitle = customTitle || safeSession.last_message;

  // Efeito de digitação apenas se enableTyping = true e não tem título customizado
  const { displayedText, isTyping } = useTypingEffectWithTruncate(
    displayTitle,
    60,
    30,
    enableTyping && !customTitle
  );

  // Foca no input quando entra em modo de edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Formata timestamp usando date-fns
  const formatTimestamp = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return 'agora';
    }
  };

  /**
   * Inicia modo de edição
   */
  const handleStartEdit = (e) => {
    e.stopPropagation();
    setEditValue(customTitle || safeSession.last_message);
    setIsEditing(true);
  };

  /**
   * Salva o novo título
   */
  const handleSave = (e) => {
    e?.stopPropagation();
    const trimmedValue = editValue.trim();

    // Se o valor for igual ao last_message original, remove o título customizado
    if (trimmedValue === safeSession.last_message || trimmedValue === '') {
      onRename?.(safeSession.session_id, null);
    } else {
      onRename?.(safeSession.session_id, trimmedValue);
    }

    setIsEditing(false);
  };

  /**
   * Cancela a edição
   */
  const handleCancel = (e) => {
    e?.stopPropagation();
    setIsEditing(false);
    setEditValue('');
  };

  /**
   * Handler para teclas no input
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave(e);
    } else if (e.key === 'Escape') {
      handleCancel(e);
    }
  };

  // Modo de edição
  if (isEditing) {
    return (
      <div
        className={`
          w-full px-3 py-3 rounded-xl
          bg-gradient-to-r from-primary-50 to-secondary-50/30
          dark:from-primary-900/20 dark:to-secondary-900/10
          ring-2 ring-primary-400 dark:ring-primary-500
          shadow-lg
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {/* Ícone */}
          <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white shadow-md">
            <Pencil className="w-4 h-4" />
          </div>

          {/* Input de edição */}
          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={100}
              placeholder="Digite o título..."
              className="
                w-full px-2 py-1.5 text-sm font-medium
                bg-white dark:bg-dark-bg
                border border-primary-300 dark:border-primary-600
                rounded-lg
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400
                transition-all duration-200
              "
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter para salvar, Esc para cancelar
            </p>
          </div>

          {/* Botões de ação */}
          <div className="flex-shrink-0 flex items-center gap-1">
            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              title="Salvar"
              aria-label="Salvar título"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Cancelar"
              aria-label="Cancelar edição"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modo normal
  return (
    <button
      onClick={() => !isDeleting && onSelect()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
      {/* Overlay ativo */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 dark:from-primary-400/10 dark:to-secondary-400/10 pointer-events-none" />
      )}

      <div className="relative flex items-start gap-3">
        {/* Ícone */}
        <div className={`
          flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
          ${isActive
            ? 'bg-gradient-to-br from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white shadow-md shadow-primary-500/30'
            : 'bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-gray-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400'
          }
        `}>
          <MessageSquare className="w-4 h-4" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className={`
              text-sm leading-snug font-medium truncate
              ${isActive ? 'text-primary-900 dark:text-primary-100' : ''}
            `}>
              {displayedText}
              {/* Cursor piscante durante digitação */}
              {isTyping && (
                <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary-600 dark:bg-primary-400 animate-blink align-middle" />
              )}
            </p>
            {/* Indicador de título customizado */}
            {customTitle && (
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400" title="Título personalizado" />
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-2 text-xs mt-1.5">
            <div className={`flex items-center gap-1 ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
              <Clock className="w-3 h-3" />
              <span>{formatTimestamp(safeSession.created_at)}</span>
            </div>
            {safeSession.message_count > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className={`flex items-center gap-1 ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  <MessageSquare className="w-3 h-3" />
                  <span>{safeSession.message_count}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex-shrink-0 flex items-center gap-0.5">
          {isActive && !isHovered && (
            <ChevronRight className="w-4 h-4 text-primary-600 dark:text-primary-400 animate-pulse" />
          )}

          {/* Botão Editar */}
          <button
            onClick={handleStartEdit}
            disabled={isDeleting}
            className={`
              p-1.5 rounded-lg transition-all duration-200
              ${(isHovered || isActive) && !isDeleting ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
              text-gray-400 hover:text-primary-600 dark:hover:text-primary-400
              hover:bg-primary-50 dark:hover:bg-primary-900/20
              disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110
            `}
            title="Editar título"
            aria-label="Editar título da conversa"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Botão Excluir */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
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
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Indicador lateral ativo */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-primary-600 via-primary-500 to-primary-600 dark:from-primary-500 dark:via-primary-400 dark:to-primary-500 rounded-r-full shadow-lg shadow-primary-500/50" />
      )}
    </button>
  );
});

ConversationItem.displayName = 'ConversationItem';

ConversationItem.propTypes = {
  session: PropTypes.shape({
    session_id: PropTypes.string.isRequired,
    last_message: PropTypes.string,
    created_at: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
    message_count: PropTypes.number,
  }).isRequired,
  /** Título customizado definido pelo usuário (sobrescreve last_message) */
  customTitle: PropTypes.string,
  isActive: PropTypes.bool,
  isDeleting: PropTypes.bool,
  isHovered: PropTypes.bool,
  enableTyping: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  /** Callback para renomear: (sessionId, newTitle) => void. newTitle=null remove título customizado */
  onRename: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

ConversationItem.defaultProps = {
  customTitle: null,
  isActive: false,
  isDeleting: false,
  isHovered: false,
  enableTyping: false,
  onRename: () => {},
  onMouseEnter: () => {},
  onMouseLeave: () => {},
};

export default ConversationItem;
