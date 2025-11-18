import { Bot } from 'lucide-react';
import { AGENT_NAME } from '../../constants/chatConstants';

/**
 * TypingIndicator - Indicador profissional de que o agente está digitando
 * Similar ao ChatGPT/Claude
 */
const TypingIndicator = () => {
  return (
    <div className="group flex justify-start animate-fade-in w-full" role="status" aria-label="Agente está digitando">
      <div className="w-full max-w-3xl">
        {/* Header do agente */}
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
          <Bot className="w-4 h-4" />
          <span className="font-medium">{AGENT_NAME}</span>
        </div>

        {/* Pontos animados */}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <div className="flex gap-1.5 px-4 py-3 bg-gray-100 dark:bg-dark-hover rounded-2xl">
            <span
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '1s' }}
            />
            <span
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: '150ms', animationDuration: '1s' }}
            />
            <span
              className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
              style={{ animationDelay: '300ms', animationDuration: '1s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
