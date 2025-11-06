import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { AGENT_NAME } from '../../constants/chatConstants';

const THINKING_STATES = [
  'Pensando',
  'Analisando',
  'Processando',
  'Elaborando resposta',
];

const LoadingIndicator = () => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      setTimeout(() => {
        setCurrentStateIndex((prev) => (prev + 1) % THINKING_STATES.length);
        setIsTransitioning(false);
      }, 150);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[80%] rounded-lg p-3 shadow-sm bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
        <div className="flex items-center gap-2 mb-1 text-xs opacity-70 text-gray-900 dark:text-gray-100">
          <Bot className="w-4 h-4" />
          <span>{AGENT_NAME}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary-500 dark:bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary-500 dark:bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary-500 dark:bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span
            className={`text-sm text-gray-600 dark:text-gray-400 font-medium transition-opacity duration-150 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {THINKING_STATES[currentStateIndex]}...
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;