import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ArrowDown } from 'lucide-react';
import { useChat, useSmartScroll, useKeyboardShortcuts } from './hooks';
import {
  ChatMessage,
  ChatInput,
  EmptyState,
  ErrorMessage,
  TypingIndicator,
  MessageSkeleton,
} from './components';

/**
 * Interface do Chat
 * 
 * Com rotas dinâmicas, este componente é REMONTADO quando sessionId muda
 * (via key no Chat.jsx), garantindo estado limpo.
 */
const ChatInterface = ({ sessionId, onSessionCreated, onFirstMessage }) => {
  const {
    messages,
    isLoading,
    isStreaming,
    isLoadingHistory,
    error,
    sendMessage: sendMessageBase,
    stopGeneration,
    sendFeedback,
    sessionId: currentSessionId
  } = useChat(true, sessionId);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  
  // Refs para callbacks
  const callbacksRef = useRef({ onSessionCreated, onFirstMessage });
  const hasNotifiedFirstMessage = useRef(false);

  // Atualiza refs
  useEffect(() => {
    callbacksRef.current = { onSessionCreated, onFirstMessage };
  }, [onSessionCreated, onFirstMessage]);

  // Smart scroll
  const {
    handleScroll,
    scrollToBottom,
    showNewMessageBadge,
    newMessageCount,
  } = useSmartScroll(messages, isStreaming, containerRef, messagesEndRef);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    messages,
    isStreaming,
    scrollToBottom,
    stopGeneration,
    inputRef: null,
  });

  /**
   * Notifica primeira mensagem do usuário (para typing effect no sidebar)
   */
  useEffect(() => {
    if (hasNotifiedFirstMessage.current) return;
    if (!currentSessionId || messages.length === 0) return;

    const firstUserMsg = messages.find(m => m.type === 'user');
    if (firstUserMsg?.content) {
      hasNotifiedFirstMessage.current = true;
      callbacksRef.current.onFirstMessage?.(currentSessionId, firstUserMsg.content);
    }
  }, [messages, currentSessionId]);

  /**
   * Wrapper para sendMessage que passa callback de sessionCreated
   */
  const handleSendMessage = useCallback((question) => {
    sendMessageBase(question, callbacksRef.current.onSessionCreated);
  }, [sendMessageBase]);

  /**
   * Callback para feedback
   */
  const handleFeedback = useCallback(async (messageId, rating, comment) => {
    return await sendFeedback(messageId, rating, comment);
  }, [sendFeedback]);

  // Estados derivados
  const isEmpty = messages.length === 0 && !isLoading && !isLoadingHistory;
  const showSkeleton = isLoadingHistory && messages.length === 0;

  // Loading
  if (showSkeleton) {
    return (
      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-dark-bg overflow-hidden">
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <MessageSkeleton count={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50 dark:bg-dark-bg relative">
      {isEmpty ? (
        /* Empty State - Centralizado */
        <div className="flex flex-col h-full min-h-screen animate-fade-in">
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 overflow-y-auto">
            <div className="flex flex-col items-center w-full max-w-2xl space-y-8 sm:space-y-10">
              <EmptyState />
              <div className="w-full">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onStopGeneration={stopGeneration}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Com Mensagens */
        <div className="flex flex-col h-full min-h-screen">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 scroll-smooth animate-fade-in"
          >
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-4">
              {messages.map((message, index) => {
                const isLast = index === messages.length - 1 && message.type === 'assistant';
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={isStreaming && isLast}
                    onFeedback={handleFeedback}
                  />
                );
              })}

              {isLoading && (messages.length === 0 || messages[messages.length - 1]?.type !== 'assistant') && (
                <TypingIndicator />
              )}

              {error && <ErrorMessage message={error} />}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {showNewMessageBadge && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-24 sm:bottom-28 right-6 sm:right-8 z-20 p-3 bg-white dark:bg-dark-card border-2 border-primary-500 dark:border-primary-400 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 group"
              aria-label={`${newMessageCount} nova${newMessageCount > 1 ? 's' : ''} mensagem${newMessageCount > 1 ? 'ns' : ''}`}
            >
              {newMessageCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5 bg-primary-600 dark:bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {newMessageCount > 9 ? '9+' : newMessageCount}
                </span>
              )}
              <ArrowDown className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-y-0.5 transition-transform" />
            </button>
          )}

          <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 pb-safe">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                onSendMessage={handleSendMessage}
                onStopGeneration={stopGeneration}
                isLoading={isLoading}
                isStreaming={isStreaming}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ChatInterface.propTypes = {
  sessionId: PropTypes.string,
  onSessionCreated: PropTypes.func,
  onFirstMessage: PropTypes.func,
};

ChatInterface.defaultProps = {
  sessionId: null,
  onSessionCreated: null,
  onFirstMessage: null,
};

export default ChatInterface;