import logo from '../../../assets/img/financial-logo.png';

const InfoModal = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-card rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center p-2">
              <img
                src={logo}
                alt="Logo Financial"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Agente da Financial
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Financial Imobiliária</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Fechar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Sobre o Agente da Financial
            </h3>
            <p>
              Assistente virtual inteligente desenvolvido para auxiliar em consultas sobre nosso setor da T.I,
              procedimentos e informações relacionadas à Financial Imobiliária.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-dark-border">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Versão 1.0.0 • Financial Imobiliária
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;