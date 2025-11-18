import logo from '../../../../assets/img/financial-logo.png';

/**
 * EmptyState estilo Claude - Minimalista
 * - Logo + Título "Como posso ajudar você hoje?"
 * - Design limpo e profissional
 */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center animate-fade-in">
    {/* Logo da empresa - estilo Claude */}
    <div className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-2.5 sm:p-3 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
          <img
            src={logo}
            alt="Financial Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>

    {/* Título principal - estilo Claude */}
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900 dark:text-gray-100 mb-6 sm:mb-8 text-center tracking-tight">
      Como posso ajudar você hoje?
    </h1>
  </div>
);

export default EmptyState;
