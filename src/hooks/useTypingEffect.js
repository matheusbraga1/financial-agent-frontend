import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para criar efeito de digitação (typing effect)
 * Similar ao ChatGPT e Claude AI
 *
 * IMPORTANTE: Este hook usa refs para rastrear valores anteriores
 * e evitar resets desnecessários quando o componente re-renderiza
 * mas o texto não mudou de fato.
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

  // Refs para evitar resets desnecessários
  const timeoutRef = useRef(null);
  const previousTextRef = useRef('');
  const hasCompletedRef = useRef(false);
  const isInitializedRef = useRef(false);

  /**
   * Limpa o timeout atual
   */
  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Efeito principal - controla inicio/reset da digitação
  useEffect(() => {
    const textActuallyChanged = text !== previousTextRef.current;

    // Se não está ativado, mostra texto completo
    if (!enabled) {
      // Só atualiza se o texto mudou ou não está mostrando o texto correto
      if (textActuallyChanged || displayedText !== text) {
        clearCurrentTimeout();
        setDisplayedText(text);
        setIsDone(true);
        setIsTyping(false);
        hasCompletedRef.current = true;
        previousTextRef.current = text;
      }
      return;
    }

    // Se o texto realmente mudou (comparação de valor, não referência)
    if (textActuallyChanged && text) {
      previousTextRef.current = text;
      clearCurrentTimeout();
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(true);
      setIsDone(false);
      hasCompletedRef.current = false;
      isInitializedRef.current = true;
    }
    // Primeira inicialização com texto (ainda não inicializado)
    else if (!isInitializedRef.current && text) {
      previousTextRef.current = text;
      clearCurrentTimeout();
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(true);
      setIsDone(false);
      hasCompletedRef.current = false;
      isInitializedRef.current = true;
    }

    return clearCurrentTimeout;
  }, [text, enabled, displayedText, clearCurrentTimeout]);

  // Efeito de digitação caractere por caractere
  useEffect(() => {
    if (!enabled || !text || !isTyping) return;

    if (currentIndex < text.length) {
      timeoutRef.current = setTimeout(() => {
        setDisplayedText(text.substring(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return clearCurrentTimeout;
    } else if (currentIndex === text.length && text.length > 0) {
      setIsTyping(false);
      setIsDone(true);
      hasCompletedRef.current = true;
    }
  }, [currentIndex, text, speed, enabled, isTyping, clearCurrentTimeout]);

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
  // Garante que text seja sempre uma string
  const safeText = text || 'Nova conversa';
  const truncatedText = truncateText(safeText, maxLength);
  const typingResult = useTypingEffect(truncatedText, speed, enabled);

  return {
    ...typingResult,
    fullText: safeText,
    isTruncated: safeText.length > maxLength,
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
  // Garante que text seja uma string válida
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return 'Nova conversa';
  }

  const cleanText = text.trim().replace(/\s+/g, ' ');

  if (cleanText.length <= maxLength) {
    return cleanText;
  }

  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
};

export default useTypingEffect;
