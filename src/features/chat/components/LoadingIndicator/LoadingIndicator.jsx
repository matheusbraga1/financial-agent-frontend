import { Bot } from 'lucide-react';

const LoadingIndicator = () => (
  <div className="flex justify-start animate-fade-in">
    <div className="max-w-[80%] rounded-lg p-3 shadow-sm bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
      <div className="flex items-center gap-2 mb-1 text-xs opacity-70 text-gray-900 dark:text-gray-100">
        <Bot className="w-4 h-4" />
        <span>Assistente</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">digitando...</span>
      </div>
    </div>
  </div>
);

export default LoadingIndicator;