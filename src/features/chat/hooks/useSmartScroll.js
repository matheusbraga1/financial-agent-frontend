import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook para gerenciar scroll inteligente no chat
 * - Auto-scroll apenas quando usuário está no bottom
 * - Badge de nova mensagem quando usuário scrollou acima
 * - Controle manual de scroll
 * - Respeita quando usuário scrollou durante streaming
 */
export const useSmartScroll = (messages, isStreaming, containerRef, messagesEndRef) => {
  const [userScrolled, setUserScrolled] = useState(false);
  const [showNewMessageBadge, setShowNewMessageBadge] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

  // Ref para rastrear última contagem de mensagens
  const lastMessageCountRef = useRef(messages.length);
  const hasInitialScrolled = useRef(false);

  /**
   * Detecta se usuário scrollou manualmente
   */
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Considera "no final" se está a menos de 100px do bottom
    const isNearBottom = distanceFromBottom < 100;

    // Usuário scrollou para cima
    if (!isNearBottom) {
      setUserScrolled(true);
      setAutoScroll(false);
      setShowNewMessageBadge(true);
    } else {
      // Usuário voltou para o final
      setUserScrolled(false);
      setAutoScroll(true);
      setShowNewMessageBadge(false);
      setNewMessageCount(0);
    }
  }, [containerRef]);

  /**
   * Scroll para o bottom
   */
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    setAutoScroll(true);
    setUserScrolled(false);
    setShowNewMessageBadge(false);
    setNewMessageCount(0);
  }, [containerRef]);

  /**
   * Auto-scroll quando novas mensagens chegam
   * Apenas se usuário não scrollou manualmente
   */
  useEffect(() => {
    const messageCountChanged = messages.length !== lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    // Só faz auto-scroll se:
    // 1. O número de mensagens mudou (nova mensagem real)
    // 2. autoScroll está ativo
    // 3. Usuário não scrollou manualmente
    if (messageCountChanged && autoScroll && !userScrolled) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    } else if (messageCountChanged && userScrolled) {
      // Incrementa contador apenas para novas mensagens reais
      setNewMessageCount(prev => prev + 1);
      setShowNewMessageBadge(true);
    }
  }, [messages.length, autoScroll, userScrolled, messagesEndRef]);

  /**
   * Durante streaming, auto-scroll apenas se usuário não scrollou
   * Usa behavior 'auto' para evitar conflitos com smooth scroll
   */
  useEffect(() => {
    if (isStreaming && autoScroll && !userScrolled) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'auto',
        block: 'end'
      });
    }
  }, [messages, isStreaming, autoScroll, userScrolled, messagesEndRef]);

  /**
   * Scroll inicial quando histórico é carregado
   * Usa requestAnimationFrame + timeout para garantir que o DOM está renderizado
   */
  useEffect(() => {
    if (messages.length > 0 && !hasInitialScrolled.current && !isStreaming) {
      hasInitialScrolled.current = true;

      // Aguarda o próximo frame + pequeno delay para garantir renderização completa
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }, 100);
      });
    }
  }, [messages.length, isStreaming, containerRef]);

  return {
    handleScroll,
    scrollToBottom,
    showNewMessageBadge,
    newMessageCount,
    autoScroll,
  };
};
