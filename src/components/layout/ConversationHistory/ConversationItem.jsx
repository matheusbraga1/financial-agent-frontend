import { memo } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, Trash2, Loader2, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTypingEffectWithTruncate } from '../../../hooks';

/**
 * Item individual de conversa no histórico
 * - Com efeito de digitação opcional
 * - Design premium com animações
 * - Totalmente acessível
 *
 * @component
 */
const ConversationItem = memo(({
  session,
  isActive,
  isDeleting,
  isHovered,
  enableTyping,
  onSelect,
  onDelete,
  onMouseEnter,
  onMouseLeave,
}) => {
  // Efeito de digitação apenas se enableTyping = true
  const { displayedText, isTyping } = useTypingEffectWithTruncate(
    session.last_message,
    60,
    30,
    enableTyping
  );

  // Formata timestamp usando date-fns
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
          <p className={`
            text-sm leading-snug mb-1.5 font-medium
            ${isActive ? 'text-primary-900 dark:text-primary-100' : ''}
          `}>
            {displayedText}
            {/* Cursor piscante durante digitação */}
            {isTyping && (
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary-600 dark:bg-primary-400 animate-blink align-middle" />
            )}
          </p>

          {/* Metadata */}
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

        {/* Ações */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {isActive && (
            <ChevronRight className="w-4 h-4 text-primary-600 dark:text-primary-400 animate-pulse" />
          )}
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
  isActive: PropTypes.bool,
  isDeleting: PropTypes.bool,
  isHovered: PropTypes.bool,
  enableTyping: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

ConversationItem.defaultProps = {
  isActive: false,
  isDeleting: false,
  isHovered: false,
  enableTyping: false,
  onMouseEnter: () => {},
  onMouseLeave: () => {},
};

export default ConversationItem;
