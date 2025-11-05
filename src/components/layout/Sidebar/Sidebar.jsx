import { useState } from 'react';
import { Plus, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';
import InfoModal from '../Header/InfoModal';
import logo from '../../../assets/img/financial-logo.png';

const Sidebar = ({ isMobileOpen, onToggleMobile, onNewConversation }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const handleNewConversation = () => {
    if (onNewConversation && !isCreatingConversation) {
      setIsCreatingConversation(true);
      onNewConversation();

      // Usar ID fixo para evitar duplicatas de toast
      toast.success('Nova conversa iniciada!', {
        id: 'new-conversation',
      });

      // Fechar sidebar em mobile após criar nova conversa
      if (onToggleMobile && isMobileOpen) {
        onToggleMobile();
      }

      // Cooldown de 1.5 segundos para evitar spam
      setTimeout(() => {
        setIsCreatingConversation(false);
      }, 1500);
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <img
                  src={logo}
                  alt="Logo Financial"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">
                Agente da Financial
              </h1>
            </div>

            {/* Botão fechar mobile */}
            <button
              onClick={onToggleMobile}
              className="lg:hidden p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover rounded"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Botão Nova Conversa */}
          <button
            onClick={handleNewConversation}
            disabled={isCreatingConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-primary-700"
            title="Iniciar uma nova conversa"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nova Conversa</span>
          </button>
        </div>

        {/* Área de conteúdo (histórico futuro) */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            Histórico de conversas em breve...
          </div>
        </div>

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          {/* Botão Sobre */}
          <button
            onClick={() => setShowInfo(true)}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover rounded-lg transition-colors"
          >
            <Info className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <div className="text-left">
              <div className="text-sm font-medium">Sobre o Agente</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Financial Imobiliária v1.0.0</div>
            </div>
          </button>
        </div>
      </aside>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </>
  );
};

export default Sidebar;
