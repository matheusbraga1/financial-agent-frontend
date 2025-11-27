import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ArrowDown } from 'lucide-react';
import { useChat, useSmartScroll, useKeyboardShortcuts } from './hooks';
import {
  ChatMessage,
  ChatInput,
  EmptyState,
  ErrorMessage,
  MessageSkeleton,
} from './components';

/**
 * Interface do Chat
 *
 * Com rotas dinâmicas, este componente é REMONTADO quando key muda em Chat.jsx.
 * A key garante estado limpo ao trocar de conversa.
 */
const ChatInterface = ({ sessionId, greetingIndex = 0, userName = null, onSessionCreated, onFirstMessage }) => {
  const {
    messages,
    isLoading,
    isStreaming,
    isLoadingHistory,
    error,
    sendMessage: sendMessageBase,
    stopGeneration,
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
        /* Empty State - Centralizado (optical center) */
        <div className="flex flex-col h-full min-h-screen animate-fade-in">
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 overflow-y-auto">
            <div className="flex flex-col items-center w-full max-w-2xl space-y-8 sm:space-y-10 -mt-16 sm:-mt-20">
              <EmptyState greetingIndex={greetingIndex} userName={userName} />
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
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-20 sm:pb-24">
              {messages.map((message, index) => {
                const isLast = index === messages.length - 1 && message.type === 'assistant';
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={isStreaming && isLast}
                    isLoading={isLoading && isLast}
                  />
                );
              })}

              {error && <ErrorMessage message={error} />}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input flutuante - fixo na parte inferior, considera sidebar em lg */}
          <div className="fixed bottom-0 left-0 right-0 lg:left-72 z-30 pointer-events-none pb-safe">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 pointer-events-auto relative">
              {/* Botão de scroll centralizado acima do input */}
              {showNewMessageBadge && (
                <button
                  onClick={scrollToBottom}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 z-40 p-2 bg-white dark:bg-dark-card border border-primary-500 dark:border-primary-400 rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 group pointer-events-auto"
                  aria-label={`${newMessageCount} nova${newMessageCount > 1 ? 's' : ''} mensagem${newMessageCount > 1 ? 'ns' : ''}`}
                >
                  {newMessageCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-primary-600 dark:bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                      {newMessageCount > 9 ? '9+' : newMessageCount}
                    </span>
                  )}
                  <ArrowDown className="w-4 h-4 text-primary-600 dark:text-primary-400 group-hover:translate-y-0.5 transition-transform" />
                </button>
              )}
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
  greetingIndex: PropTypes.number,
  userName: PropTypes.string,
  onSessionCreated: PropTypes.func,
  onFirstMessage: PropTypes.func,
};

ChatInterface.defaultProps = {
  sessionId: null,
  greetingIndex: 0,
  userName: null,
  onSessionCreated: null,
  onFirstMessage: null,
};

export default ChatInterface;