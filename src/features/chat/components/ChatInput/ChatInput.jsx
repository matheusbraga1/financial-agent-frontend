import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Square } from 'lucide-react';
import {
  MAX_MESSAGE_LENGTH,
  CHARACTER_LIMIT_WARNING,
  TEXTAREA_MIN_HEIGHT,
  TEXTAREA_MAX_HEIGHT,
} from '../../constants/chatConstants';

/**
 * ChatInput Premium - Input de mensagens com design profissional
 *
 * Recursos:
 * - Auto-resize do textarea
 * - Contador de caracteres com avisos visuais
 * - Animações e microinterações
 * - Totalmente responsivo (mobile-first)
 * - Acessibilidade completa
 * - Cores da marca Financial (#00884f verde, #bf9c4b dourado)
 * - Botão de parar geração durante streaming
 */
const ChatInput = ({ onSendMessage, onStopGeneration, isLoading, isStreaming }) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize do textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, TEXTAREA_MAX_HEIGHT)}px`;
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();

    if (trimmedInput && !isLoading && !isStreaming) {
      onSendMessage(trimmedInput);
      setInput('');

      // Reset altura do textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleStop = (e) => {
    e.preventDefault();
    onStopGeneration?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) {
        handleSubmit(e);
      }
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
  const isAtLimit = remainingChars === 0;
  const canSubmit = input.trim() && !isLoading && !isStreaming;

  // Determinar cor do contador baseado em proximidade do limite
  const getCounterColor = () => {
    if (isAtLimit) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700';
    if (remainingChars < 50) return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700';
    if (isNearLimit) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700';
    return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 border-gray-300 dark:border-gray-700';
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto px-3 sm:px-4 lg:px-0">
      {/* Container principal */}
      <div className="relative">
        {/* Input principal */}
        <div
          className={`
            relative bg-white dark:bg-dark-card rounded-2xl sm:rounded-3xl
            border-2 transition-all duration-300 ease-in-out
            shadow-lg hover:shadow-xl
            ${isFocused
              ? 'border-primary-500 dark:border-primary-600 ring-4 ring-primary-100 dark:ring-primary-900/30 shadow-2xl shadow-primary-500/10 dark:shadow-primary-900/30'
              : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-primary-800'
            }
          `}
        >

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Faça uma pergunta sobre a Financial Imobiliária..."
            disabled={isLoading || isStreaming}
            rows={1}
            className="
              w-full px-4 sm:px-5 lg:px-6 py-3 sm:py-4 pr-20 sm:pr-28
              bg-transparent rounded-2xl sm:rounded-3xl
              outline-none focus:outline-none focus-visible:outline-none
              resize-none
              disabled:opacity-50 disabled:cursor-not-allowed
              text-sm sm:text-base lg:text-lg
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              selection:bg-primary-200 dark:selection:bg-primary-700
              selection:text-primary-900 dark:selection:text-primary-100
              leading-relaxed
            "
            style={{
              minHeight: `${TEXTAREA_MIN_HEIGHT}px`,
              maxHeight: `${TEXTAREA_MAX_HEIGHT}px`,
              outline: 'none',
              border: 'none',
            }}
            aria-label="Campo de mensagem"
            aria-describedby="input-help"
          />

          {/* Ações (contador + botão enviar) */}
          <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 flex items-center gap-1.5 sm:gap-2">
            {/* Contador de caracteres progressivo */}
            {isNearLimit && (
              <div
                className={`
                  text-[10px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg
                  transition-all duration-200 font-semibold border
                  ${getCounterColor()}
                  ${isAtLimit ? 'animate-pulse' : ''}
                `}
                role="status"
                aria-live="polite"
                aria-label={`${remainingChars} caracteres restantes`}
              >
                {remainingChars}
              </div>
            )}

            {/* Botão com 3 estados: Enviar / Loading / Parar */}
            {isStreaming ? (
              /* Botão Parar - Ativo durante streaming */
              <button
                type="button"
                onClick={handleStop}
                className="
                  relative overflow-hidden
                  p-2.5 sm:p-3 lg:p-3.5
                  rounded-xl sm:rounded-2xl
                  font-medium text-white
                  transition-all duration-200 ease-out
                  flex items-center justify-center
                  min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px]
                  touch-manipulation
                  bg-gradient-to-r from-red-600 to-red-500
                  dark:from-red-500 dark:to-red-400
                  hover:from-red-700 hover:to-red-600
                  dark:hover:from-red-600 dark:hover:to-red-500
                  hover:shadow-lg hover:shadow-red-500/30
                  dark:hover:shadow-red-900/50
                  hover:scale-105 active:scale-95
                  cursor-pointer
                  animate-pulse-soft
                "
                title="Parar geração"
                aria-label="Parar geração"
              >
                <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>
            ) : (
              /* Botão Enviar / Loading */
              <button
                type="submit"
                disabled={!canSubmit}
                className={`
                  relative overflow-hidden
                  p-2.5 sm:p-3 lg:p-3.5
                  rounded-xl sm:rounded-2xl
                  font-medium text-white
                  transition-all duration-200 ease-out
                  flex items-center justify-center
                  min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px]
                  touch-manipulation
                  ${canSubmit
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 hover:from-primary-700 hover:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-500 hover:shadow-lg hover:shadow-primary-500/30 dark:hover:shadow-primary-900/50 hover:scale-105 active:scale-95 cursor-pointer'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }
                `}
                title={isLoading ? "Enviando..." : canSubmit ? "Enviar mensagem (Enter)" : "Digite uma mensagem"}
                aria-label={isLoading ? "Enviando mensagem" : "Enviar mensagem"}
              >
                {/* Efeito de brilho no hover */}
                {canSubmit && !isLoading && (
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                )}

                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Dicas de atalhos - Desktop (discreto) */}
        <div
          id="input-help"
          className="hidden md:flex items-center justify-center gap-3 mt-3 text-xs text-gray-400 dark:text-gray-500 opacity-60"
        >
          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-hover border border-gray-300 dark:border-dark-border rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
              Enter
            </kbd>
            <span>enviar</span>
          </div>

          <span className="text-gray-300 dark:text-gray-600">•</span>

          <div className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-hover border border-gray-300 dark:border-dark-border rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
              Shift
            </kbd>
            <span>+</span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-hover border border-gray-300 dark:border-dark-border rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
              Enter
            </kbd>
            <span>nova linha</span>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ChatInput;
