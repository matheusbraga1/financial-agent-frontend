import { useState, useEffect } from 'react';

/**
 * ThinkingIndicator - Indicador de loading estilo Claude
 *
 * Mostra palavras que se alternam com efeito de digitação e cursor
 * Similar ao efeito do Claude AI durante geração de resposta
 * Cores alternadas: verde da marca e dourado
 */
const ThinkingIndicator = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Palavras que indicam o processo de geração
  const words = [
    'Pensando',
    'Analisando',
    'Processando',
    'Escrevendo',
  ];

  // Cores alternadas: verde (primary) e dourado
  const colors = [
    'text-primary-600 dark:text-primary-400', // Verde
    'text-amber-500 dark:text-amber-400',     // Dourado
  ];

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const typingSpeed = 50; // Velocidade de digitação
    const deletingSpeed = 30; // Velocidade de apagar
    const pauseTime = 1500; // Pausa quando palavra completa

    let timeout;

    if (!isDeleting) {
      // Digitando
      if (displayedText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        }, typingSpeed);
      } else {
        // Palavra completa - pausa antes de apagar
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      // Apagando
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.substring(0, displayedText.length - 1));
        }, deletingSpeed);
      } else {
        // Palavra apagada - próxima palavra
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWordIndex, words]);

  // Cor atual baseada no índice da palavra
  const currentColor = colors[currentWordIndex % colors.length];
  const cursorColor = currentWordIndex % 2 === 0
    ? 'bg-primary-500 dark:bg-primary-400'
    : 'bg-amber-500 dark:bg-amber-400';

  return (
    <div className="inline-flex items-center">
      <span className={`text-sm font-medium ${currentColor} transition-colors duration-300`}>
        {displayedText}
        <span className={`inline-block w-0.5 h-4 ${cursorColor} ml-0.5 animate-blink align-middle transition-colors duration-300`} />
      </span>
    </div>
  );
};

export default ThinkingIndicator;
