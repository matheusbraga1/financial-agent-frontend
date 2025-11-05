import { SUGGESTED_QUESTIONS } from '../../constants/chatConstants';
import logo from '../../../../assets/img/financial-logo.png';

const EmptyState = ({ onSuggestionClick }) => (
  <div className="text-center py-12 px-4">
    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900 dark:to-primary-800 mb-4 ring-4 ring-primary-50 dark:ring-primary-900 p-3">
      <img
        src={logo}
        alt="Logo Financial"
        className="w-full h-full object-contain"
      />
    </div>

    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
      Bem-vindo ao Chat da Financial!
    </h3>

    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
      Tire suas dúvidas sobre assuntos relacionados à nossa empresa.
    </p>

    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTED_QUESTIONS.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSuggestionClick(suggestion)}
          className="px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
);

export default EmptyState;