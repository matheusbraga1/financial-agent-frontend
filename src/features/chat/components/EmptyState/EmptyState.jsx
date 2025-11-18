import { Sparkles, FileText, HelpCircle, Lightbulb } from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '../../constants/chatConstants';
import logo from '../../../../assets/img/financial-logo.png';
import ModelSelector from '../ModelSelector';

/**
 * EmptyState Premium - ChatGPT/Claude Style
 * Design moderno e profissional para estado inicial do chat
 */
const EmptyState = ({ onSuggestionClick, onModelChange }) => {
  // Ícones para as sugestões (rotacionando entre eles)
  const suggestionIcons = [Lightbulb, HelpCircle, FileText, Sparkles];

  return (
    <div className="text-center w-full max-w-4xl mx-auto animate-fade-in">
      {/* Logo e Título Principal */}
      <div className="mb-8 sm:mb-12">
        {/* Logo Grande com Animação */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-3xl blur-2xl animate-pulse-slow" />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600 dark:from-primary-500 dark:via-primary-400 dark:to-primary-500 flex items-center justify-center p-4 shadow-2xl shadow-primary-500/30 dark:shadow-primary-900/40 ring-4 ring-primary-100 dark:ring-primary-900/50">
            <img
              src={logo}
              alt="Financial Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Título e Subtítulo */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 dark:from-primary-400 dark:via-primary-300 dark:to-primary-400 bg-clip-text text-transparent">
            Como posso ajudar você hoje?
          </span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-lg mx-auto px-4 mb-6">
          Sou o assistente virtual da Financial Imobiliária. Posso responder suas dúvidas sobre processos, documentos e procedimentos.
        </p>

        {/* Model Selector - Estilo ChatGPT */}
        <div className="flex justify-center">
          <ModelSelector
            variant="minimal"
            onModelChange={onModelChange}
          />
        </div>
      </div>

      {/* Sugestões em Grid Moderno */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto px-4">
        {SUGGESTED_QUESTIONS.map((suggestion, index) => {
          const Icon = suggestionIcons[index % suggestionIcons.length];

          return (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="group relative overflow-hidden bg-white dark:bg-dark-card hover:bg-gradient-to-br hover:from-primary-50 hover:to-white dark:hover:from-primary-900/20 dark:hover:to-dark-card border-2 border-gray-200 dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-left transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 dark:hover:shadow-primary-900/20 hover:-translate-y-1 active:scale-98 touch-manipulation"
            >
              {/* Gradiente de fundo sutil no hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-secondary-500/0 group-hover:from-primary-500/5 group-hover:to-secondary-500/5 transition-all duration-300" />

              {/* Conteúdo */}
              <div className="relative flex items-start gap-3">
                {/* Ícone */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                    {suggestion}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dica de uso */}
      <div className="mt-8 sm:mt-12 flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
        <Sparkles className="w-4 h-4" />
        <span>Ou digite sua própria pergunta abaixo</span>
      </div>
    </div>
  );
};

export default EmptyState;