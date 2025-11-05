import { useEffect, useRef } from 'react';
import { useChat } from './hooks';
import { ThemeToggle } from '../../components/common';
import {
  ChatMessage,
  ChatInput,
  EmptyState,
  ErrorMessage,
  LoadingIndicator,
} from './components';

const ChatInterface = ({ onClearMessages }) => {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat(true);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  }, [messages]);

  // Expor a função clearMessages para o componente pai
  useEffect(() => {
    if (onClearMessages) {
      onClearMessages(() => clearMessages);
    }
  }, [onClearMessages, clearMessages]);

  return (
    <div className="flex flex-col flex-1 bg-neutral-50 dark:bg-dark-bg overflow-hidden relative">
      {/* Theme Toggle - Desktop only */}
      <div className="hidden lg:block absolute top-4 right-6 z-10">
        <ThemeToggle />
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={sendMessage} />
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}

              {isLoading && <LoadingIndicator />}
            </>
          )}

          {error && <ErrorMessage message={error} />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 bg-gradient-to-t from-neutral-50 dark:from-dark-bg to-transparent px-4 py-6">
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatInterface;