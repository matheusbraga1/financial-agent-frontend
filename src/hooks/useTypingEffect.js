import { useState, useEffect, useRef } from 'react';

/**
 * Hook para criar efeito de digitação (typing effect)
 * Similar ao ChatGPT e Claude AI
 *
 * @param {string} text - Texto completo a ser digitado
 * @param {number} speed - Velocidade de digitação em ms (default: 30)
 * @param {boolean} enabled - Se o efeito está ativo (default: true)
 * @returns {Object} { displayedText, isTyping, isDone }
 *
 * @example
 * const { displayedText, isTyping } = useTypingEffect('Hello World', 50);
 */
export const useTypingEffect = (text, speed = 30, enabled = true) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Se não está ativado, mostra texto completo imediatamente
    if (!enabled) {
      setDisplayedText(text);
      setIsDone(true);
      setIsTyping(false);
      return;
    }

    // Reset quando o texto muda
    if (text) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(true);
      setIsDone(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, enabled]);

  useEffect(() => {
    if (!enabled || !text) return;

    if (currentIndex < text.length) {
      setIsTyping(true);

      timeoutRef.current = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else if (currentIndex === text.length && text.length > 0) {
      setIsTyping(false);
      setIsDone(true);
    }
  }, [currentIndex, text, speed, enabled]);

  return {
    displayedText,
    isTyping,
    isDone,
  };
};

/**
 * Hook para truncar texto com efeito de digitação
 * Útil para títulos de conversas no histórico
 *
 * @param {string} text - Texto completo
 * @param {number} maxLength - Comprimento máximo (default: 60)
 * @param {number} speed - Velocidade de digitação em ms (default: 30)
 * @param {boolean} enabled - Se o efeito está ativo (default: true)
 * @returns {Object} { displayedText, isTyping, isDone, fullText }
 */
export const useTypingEffectWithTruncate = (
  text,
  maxLength = 60,
  speed = 30,
  enabled = true
) => {
  const truncatedText = truncateText(text, maxLength);
  const typingResult = useTypingEffect(truncatedText, speed, enabled);

  return {
    ...typingResult,
    fullText: text,
    isTruncated: text.length > maxLength,
  };
};

/**
 * Utilitário para truncar texto inteligentemente
 * Respeita palavras completas
 *
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} Texto truncado com '...' se necessário
 */
const truncateText = (text, maxLength = 60) => {
  if (!text || text.trim() === '') return 'Nova conversa';

  const cleanText = text.trim().replace(/\s+/g, ' ');

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
};

export default useTypingEffect;
