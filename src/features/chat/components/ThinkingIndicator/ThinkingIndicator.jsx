import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { AGENT_NAME } from '../../constants/chatConstants';

/**
 * ThinkingIndicator - Indicador de loading estilo Claude
 *
 * Mostra palavras que se alternam com efeito de digitação e cursor
 * Similar ao efeito do Claude AI durante geração de resposta
 */
const ThinkingIndicator = ({ inline = false }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const words = ['Pensando', 'Analisando', 'Processando', 'Escrevendo'];

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const typingSpeed = 50;
    const deletingSpeed = 30;
    const pauseTime = 1500;

    let timeout;

    if (!isDeleting) {
      if (displayedText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWordIndex, words]);

  // Versão inline (para uso dentro de ChatMessage durante streaming)
  if (inline) {
    return (
      <div className="inline-flex items-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {displayedText}
          <span className="inline-block w-0.5 h-4 bg-gray-500 dark:bg-gray-400 ml-0.5 animate-blink align-middle" />
        </span>
      </div>
    );
  }

  // Versão completa (para uso no ChatInterface quando aguardando resposta)
  return (
    <div className="group flex justify-start animate-fade-in w-full" role="status" aria-label="Agente está digitando">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
          <Bot className="w-4 h-4" />
          <span className="font-medium">{AGENT_NAME}</span>
        </div>
        <div className="inline-flex items-center">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {displayedText}
            <span className="inline-block w-0.5 h-4 bg-gray-500 dark:bg-gray-400 ml-0.5 animate-blink align-middle" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;
