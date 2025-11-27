import { memo, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Trash2, Loader2, Pencil, Check, X, MoreHorizontal } from 'lucide-react';
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
const ConversationItemBase = ({
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
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const editContainerRef = useRef(null);

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

  // Fecha menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  // Fecha edição ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editContainerRef.current && !editContainerRef.current.contains(event.target)) {
        setIsEditing(false);
        setEditValue('');
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing]);

  /**
   * Inicia modo de edição
   */
  const handleStartEdit = (e) => {
    e.stopPropagation();
    setEditValue(customTitle || safeSession.last_message);
    setShowMenu(false);
    setIsEditing(true);
  };

  /**
   * Toggle menu de ações
   */
  const handleToggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  /**
   * Excluir conversa
   */
  const handleDelete = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete();
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
        ref={editContainerRef}
        className="w-full px-2 py-2 rounded-lg bg-gray-100 dark:bg-dark-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {/* Input de edição */}
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={100}
            placeholder="Digite o título..."
            className="
              flex-1 px-2 py-1 text-sm
              bg-white dark:bg-dark-bg
              border border-gray-300 dark:border-dark-border
              rounded-md
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-1 focus:ring-primary-500 dark:focus:ring-primary-400
              transition-all duration-200
            "
          />

          {/* Botões de ação */}
          <button
            onClick={handleSave}
            className="p-1 rounded-md text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            title="Salvar"
            aria-label="Salvar título"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Cancelar"
            aria-label="Cancelar edição"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Modo normal
  return (
    <div
      role="button"
      tabIndex={isDeleting ? -1 : 0}
      onClick={() => !isDeleting && onSelect()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onKeyDown={(e) => {
        if (!isDeleting && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`
        w-full text-left px-2 h-10 flex items-center rounded-lg
        transition-all duration-300 ease-in-out
        ${isActive
          ? 'bg-gray-100 dark:bg-dark-hover'
          : 'hover:bg-gray-100 dark:hover:bg-dark-hover'
        }
        ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        group relative
      `}
    >
      <div className="flex items-center gap-2 w-full min-w-0">
        {/* Título */}
        <p className={`
          flex-1 text-sm truncate min-w-0
          ${isActive
            ? 'text-gray-900 dark:text-white font-medium'
            : 'text-gray-700 dark:text-gray-300'
          }
        `}>
          {displayedText}
          {/* Cursor piscante durante digitação */}
          {isTyping && (
            <span className="inline-block w-0.5 h-4 ml-0.5 bg-primary-600 dark:bg-primary-400 animate-blink align-middle" />
          )}
        </p>

        {/* Botão de menu "..." */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={handleToggleMenu}
            disabled={isDeleting}
            className={`
              p-1 rounded-md transition-all duration-150
              ${(isHovered || showMenu) && !isDeleting
                ? 'opacity-100'
                : 'opacity-0'
              }
              text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
              hover:bg-gray-200 dark:hover:bg-dark-border
            `}
            title="Mais opções"
            aria-label="Mais opções"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreHorizontal className="w-4 h-4" />
            )}
          </button>

          {/* Menu dropdown */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 py-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-50 min-w-[120px]">
              <button
                onClick={handleStartEdit}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Renomear
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Memo com comparação customizada para garantir re-render quando isActive muda
const ConversationItem = memo(ConversationItemBase, (prevProps, nextProps) => {
  // Retorna false para forçar re-render quando estas props mudam
  if (prevProps.isActive !== nextProps.isActive) return false;
  if (prevProps.isDeleting !== nextProps.isDeleting) return false;
  if (prevProps.isHovered !== nextProps.isHovered) return false;
  if (prevProps.enableTyping !== nextProps.enableTyping) return false;
  if (prevProps.customTitle !== nextProps.customTitle) return false;
  if (prevProps.session?.session_id !== nextProps.session?.session_id) return false;
  if (prevProps.session?.last_message !== nextProps.session?.last_message) return false;
  // Para outras props, considera iguais (evita re-render por callbacks)
  return true;
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
