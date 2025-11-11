import { SUGGESTED_QUESTIONS } from '../../constants/chatConstants';
import logo from '../../../../assets/img/financial-logo.png';

const EmptyState = ({ onSuggestionClick }) => (
  <div className="text-center py-8 sm:py-12 px-3 sm:px-4">
    {/* Logo - Responsivo */}
    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900 dark:to-primary-800 mb-3 sm:mb-4 ring-4 ring-primary-50 dark:ring-primary-900 p-2.5 sm:p-3">
      <img
        src={logo}
        alt="Logo Financial"
        className="w-full h-full object-contain"
      />
    </div>

    {/* Título - Responsivo */}
    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 px-4">
      Bem-vindo ao Chat da Financial!
    </h3>

    {/* Descrição - Responsivo */}
    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-5 sm:mb-6 px-2">
      Tire suas dúvidas sobre assuntos relacionados à nossa empresa.
    </p>

    {/* Sugestões - Grid responsivo */}
    <div className="flex flex-col sm:flex-row flex-wrap gap-2 justify-center max-w-lg mx-auto">
      {SUGGESTED_QUESTIONS.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all active:scale-95 touch-manipulation"
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
);

export default EmptyState;