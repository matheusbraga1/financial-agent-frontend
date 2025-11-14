import { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { useChat } from './hooks';
import {
  ChatMessage,
  ChatInput,
  EmptyState,
  ErrorMessage,
  LoadingIndicator,
} from './components';

/**
 * Interface principal do chat
 * - Suporta histórico de conversas
 * - Integrado com sistema de sessões do backend
 * - Feedback de mensagens
 * - Scroll inteligente
 */
const ChatInterface = ({ sessionId, forceNewConversation, onSessionCreated }) => {
  const {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    clearMessages,
    sendFeedback,
    sessionId: currentSessionId
  } = useChat(true, sessionId);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  /**
   * Detecta se usuário scrollou manualmente
   */
  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Considera "no final" se está a menos de 100px do bottom
    const isNearBottom = distanceFromBottom < 100;

    setAutoScroll(isNearBottom);
    setShowScrollButton(!isNearBottom && messages.length > 0);
  };

  /**
   * Scroll para o final (acionado por botão)
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
    setAutoScroll(true);
  };

  /**
   * Auto-scroll inteligente quando novas mensagens chegam
   * Apenas scroll automático se usuário estava no final
   */
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, autoScroll]);

  /**
   * Notifica componente pai quando session_id muda
   */
  useEffect(() => {
    if (currentSessionId && currentSessionId !== sessionId) {
      onSessionCreated?.(currentSessionId);
    }
  }, [currentSessionId, sessionId, onSessionCreated]);

  /**
   * REMOVIDO: Carregamento duplicado de histórico
   * O hook useChat já carrega o histórico automaticamente quando initialSessionId muda
   * Este useEffect estava causando requisições duplicadas ao backend
   */

  /**
   * Cria nova conversa quando solicitado
   */
  useEffect(() => {
    if (forceNewConversation) {
      clearMessages();
    }
  }, [forceNewConversation, clearMessages]);

  /**
   * Callback para envio de feedback
   */
  const handleFeedback = async (messageId, rating, comment) => {
    return await sendFeedback(messageId, rating, comment);
  };

  // Loading inicial do histórico
  if (isLoadingHistory && messages.length === 0) {
    return (
      <div className="flex flex-col flex-1 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg overflow-hidden relative items-center justify-center">
        <LoadingIndicator />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          Carregando conversa...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg overflow-hidden relative">
      {/* Container de mensagens - Responsivo com scroll inteligente */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 scroll-smooth"
      >
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={sendMessage} />
          ) : (
            <>
              {messages.map((message, index) => {
                // Detectar se é a última mensagem do assistente e está streamando
                const isLastAssistantMessage =
                  index === messages.length - 1 &&
                  message.type === 'assistant';
                const isStreamingMessage = isLoading && isLastAssistantMessage;

                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={isStreamingMessage}
                    onFeedbackSent={handleFeedback}
                  />
                );
              })}

              {/* Loading indicator se estiver esperando primeira resposta */}
              {isLoading && messages.length > 0 && messages[messages.length - 1]?.type !== 'assistant' && (
                <LoadingIndicator />
              )}
              
              {/* Loading ao iniciar conversa */}
              {isLoading && messages.length === 0 && <LoadingIndicator />}
            </>
          )}

          {/* Mensagens de erro */}
          {error && <ErrorMessage message={error} />}

          {/* Âncora para scroll automático */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Botão Scroll to Bottom - Aparece quando usuário sobe */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 sm:bottom-28 right-6 sm:right-8 z-20 p-3 bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 group"
          aria-label="Ir para o final"
        >
          <ArrowDown className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Input de mensagens - Responsivo */}
      <div className="flex-shrink-0 bg-gradient-to-t from-primary-50 dark:from-dark-bg to-transparent px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatInterface;