import { memo } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare } from 'lucide-react';

/**
 * Botão de Nova Conversa
 * - Modo expandido: ícone + texto simples
 * - Modo colapsado: apenas ícone
 */
const SidebarNewConversation = memo(({ isCollapsed, onClick }) => {
  return (
    <div className="py-3 px-3 w-full">
      <button
        onClick={onClick}
        className={`
          h-10 flex items-center rounded-lg
          text-gray-900 dark:text-white
          hover:bg-gray-100 dark:hover:bg-dark-hover
          transition-all duration-500 ease-in-out
          text-sm font-medium
          relative overflow-hidden
          ${isCollapsed ? 'w-10' : 'w-full gap-2'}
        `}
        aria-label="Novo chat"
      >
        {/* Ícone em container fixo de 40px (igual ao Avatar) */}
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-5 h-5 flex-shrink-0 min-w-[20px] min-h-[20px]" />
        </div>

        <span className={`truncate transition-all duration-500 ease-in-out ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
          Novo chat
        </span>
      </button>
    </div>
  );
});

SidebarNewConversation.propTypes = {
  isCollapsed: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

SidebarNewConversation.displayName = 'SidebarNewConversation';

export default SidebarNewConversation;
