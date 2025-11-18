import logo from '../../../../assets/img/financial-logo.png';

/**
 * EmptyState estilo Claude - Minimalista e Mobile-First
 * - Logo ao lado esquerdo do título em telas >=360px
 * - Empilhamento vertical em telas muito pequenas (<360px)
 * - Design limpo e profissional
 * - Responsivo para todos os tamanhos
 */
const EmptyState = () => (
  <div className="flex flex-col xs:flex-row items-center justify-center gap-3 xs:gap-4 md:gap-5 animate-fade-in px-4">
    {/* Logo da empresa - estilo Claude */}
    <div className="relative group flex-shrink-0">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-2 xs:p-2.5 sm:p-3 shadow-lg ring-1 ring-gray-200 dark:ring-gray-700">
        <img
          src={logo}
          alt="Financial Logo"
          className="w-full h-full object-contain"
        />
      </div>
    </div>

    {/* Título principal - estilo Claude */}
    <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-gray-900 dark:text-gray-100 tracking-tight text-center xs:text-left">
      Como posso ajudar você hoje?
    </h1>
  </div>
);

export default EmptyState;
