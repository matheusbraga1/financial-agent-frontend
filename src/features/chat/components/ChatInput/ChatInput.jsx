import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import {
  MAX_MESSAGE_LENGTH,
  CHARACTER_LIMIT_WARNING,
  TEXTAREA_MIN_HEIGHT,
  TEXTAREA_MAX_HEIGHT,
} from '../../constants/chatConstants';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    if (trimmedInput && !isLoading) {
      onSendMessage(trimmedInput);
      setInput('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setInput(value);
    }
  };

  const remainingChars = MAX_MESSAGE_LENGTH - input.length;
  const isNearLimit = remainingChars < CHARACTER_LIMIT_WARNING;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative bg-white dark:bg-dark-card rounded-xl sm:rounded-2xl border-2 border-gray-200 dark:border-dark-border shadow-lg hover:border-gray-300 dark:hover:border-primary-700 focus-within:!border-primary-500 dark:focus-within:!border-primary-400 focus-within:ring-2 sm:focus-within:ring-4 focus-within:ring-primary-100 dark:focus-within:ring-primary-500/20 focus-within:shadow-xl dark:focus-within:shadow-primary-900/50 transition-all duration-300 ease-in-out">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Envie uma mensagem..."
          disabled={isLoading}
          rows={1}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-16 sm:pr-24 bg-transparent rounded-xl sm:rounded-2xl outline-none focus:outline-none focus-visible:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 selection:bg-primary-200 dark:selection:bg-primary-700 selection:text-primary-900 dark:selection:text-primary-100"
          style={{
            minHeight: `${TEXTAREA_MIN_HEIGHT}px`,
            maxHeight: `${TEXTAREA_MAX_HEIGHT}px`,
            outline: 'none',
            border: 'none',
          }}
          aria-label="Campo de mensagem"
        />

        {/* Botões de ação - Responsivos */}
        <div className="absolute right-1.5 sm:right-2 bottom-1.5 sm:bottom-2 flex items-center gap-1">
          {/* Contador de caracteres (só aparece perto do limite) */}
          {isNearLimit && (
            <div
              className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md transition-colors text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 font-medium"
              aria-live="polite"
            >
              {remainingChars}
            </div>
          )}

          {/* Botão Enviar - Tamanho responsivo */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 sm:p-2.5 bg-primary-600 dark:bg-primary-500 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary-900/30 active:scale-95 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center touch-manipulation"
            title="Enviar mensagem (Enter)"
            aria-label="Enviar mensagem"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Dica de atalho - Ocultar em telas muito pequenas */}
      <div className="hidden sm:block mt-2 text-center text-xs text-gray-500 dark:text-gray-400 transition-colors">
        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-dark-hover border border-gray-300 dark:border-dark-border rounded text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">Enter</kbd> para enviar,
        <kbd className="ml-1 px-1.5 py-0.5 bg-gray-100 dark:bg-dark-hover border border-gray-300 dark:border-dark-border rounded text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">Shift + Enter</kbd> para nova linha
      </div>
    </form>
  );
};

export default ChatInput;