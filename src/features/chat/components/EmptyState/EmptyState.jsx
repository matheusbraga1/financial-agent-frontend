import { Sparkles } from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '../../constants/chatConstants';
import logo from '../../../../assets/img/financial-logo.png';

/**
 * EmptyState estilo Claude
 * - Layout centralizado verticalmente
 * - Logo + Título "Como posso ajudar você hoje?"
 * - Sugestões de perguntas
 * - Design minimalista e profissional
 */
const EmptyState = ({ onSuggestionClick }) => (
  <div className="flex flex-col items-center justify-center min-h-full py-8 sm:py-12 px-4 animate-fade-in">
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
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 text-center tracking-tight">
      Como posso ajudar você hoje?
    </h1>

    {/* Subtítulo opcional */}
    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-8 sm:mb-12 text-center max-w-md">
      Tire suas dúvidas sobre assuntos relacionados à Financial
    </p>

    {/* Sugestões de perguntas - Grid responsivo */}
    <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
      {SUGGESTED_QUESTIONS.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="group relative px-4 py-3 sm:py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl text-left hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary-900/20 transition-all duration-200 active:scale-[0.98]"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center group-hover:from-primary-100 group-hover:to-primary-200 dark:group-hover:from-primary-800/40 dark:group-hover:to-primary-700/40 transition-colors">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary-600 dark:text-primary-400" />
            </div>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-200 leading-relaxed">
              {suggestion}
            </span>
          </div>
        </button>
      ))}
    </div>
  </div>
);

export default EmptyState;
