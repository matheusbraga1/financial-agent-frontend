import { useState, useCallback, useEffect } from 'react';

/**
 * Hook para gerenciar scroll inteligente no chat
 * - Auto-scroll apenas quando usuário está no bottom
 * - Badge de nova mensagem quando usuário scrollou acima
 * - Controle manual de scroll
 */
export const useSmartScroll = (messages, isStreaming, containerRef, messagesEndRef) => {
  const [userScrolled, setUserScrolled] = useState(false);
  const [showNewMessageBadge, setShowNewMessageBadge] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

  /**
   * Detecta se usuário scrollou manualmente
   */
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Considera "no final" se está a menos de 100px do bottom
    const isNearBottom = distanceFromBottom < 100;

    if (!isNearBottom && !userScrolled) {
      setUserScrolled(true);
    }

    if (isNearBottom) {
      setUserScrolled(false);
      setShowNewMessageBadge(false);
      setNewMessageCount(0);
    }

    setAutoScroll(isNearBottom);
  }, [userScrolled, containerRef]);

  /**
   * Scroll para o bottom
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
    setAutoScroll(true);
    setUserScrolled(false);
    setShowNewMessageBadge(false);
    setNewMessageCount(0);
  }, [messagesEndRef]);

  /**
   * Auto-scroll quando novas mensagens chegam
   * Apenas se usuário não scrollou manualmente
   */
  useEffect(() => {
    if (autoScroll && !userScrolled) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    } else if (userScrolled && messages.length > 0) {
      // Incrementa contador de novas mensagens
      setNewMessageCount(prev => prev + 1);
      setShowNewMessageBadge(true);
    }
  }, [messages, autoScroll, userScrolled, messagesEndRef]);

  /**
   * Durante streaming, sempre auto-scroll
   */
  useEffect(() => {
    if (isStreaming && autoScroll) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, isStreaming, autoScroll, messagesEndRef]);

  return {
    handleScroll,
    scrollToBottom,
    showNewMessageBadge,
    newMessageCount,
    autoScroll,
  };
};
