import { useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { useChat, useSmartScroll, useKeyboardShortcuts } from './hooks';
import {
  ChatMessage,
  ChatInput,
  EmptyState,
  ErrorMessage,
  LoadingIndicator,
  TypingIndicator,
  MessageSkeleton,
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
    isStreaming,
    isLoadingHistory,
    error,
    sendMessage,
    stopGeneration,
    clearMessages,
    sendFeedback,
    sessionId: currentSessionId
  } = useChat(true, sessionId);

  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Smart scroll hook com badge de novas mensagens
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
    inputRef: null, // ChatInput gerencia seu próprio focus
  });

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

  // Loading inicial do histórico com skeleton
  if (isLoadingHistory && messages.length === 0) {
    return (
      <div className="flex flex-col flex-1 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <MessageSkeleton count={3} />
          </div>
        </div>
      </div>
    );
  }

  // Determina se deve mostrar layout centrado (sem mensagens)
  const isEmpty = messages.length === 0 && !isLoading;
  const hasContent = messages.length > 0 || isLoading;

  return (
    <div className="flex flex-col flex-1 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg overflow-hidden relative">
      {isEmpty ? (
        /* Layout Centralizado - ChatGPT/Claude Style */
        <div className="flex flex-col items-center justify-center flex-1 px-3 sm:px-4 md:px-6 py-8 sm:py-12 animate-fade-in">
          <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center flex-1 space-y-8">
            {/* EmptyState Centralizado */}
            <div className="flex-shrink-0">
              <EmptyState onSuggestionClick={sendMessage} />
            </div>

            {/* Input Centralizado */}
            <div className="w-full flex-shrink-0">
              <ChatInput
                onSendMessage={sendMessage}
                onStopGeneration={stopGeneration}
                isLoading={isLoading}
                isStreaming={isStreaming}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Layout Normal - Com Mensagens */
        <>
          {/* Container de mensagens - Responsivo com scroll inteligente */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 scroll-smooth animate-fade-in"
          >
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
              {messages.map((message, index) => {
                // Detectar se é a última mensagem do assistente e está streamando
                const isLastAssistantMessage =
                  index === messages.length - 1 &&
                  message.type === 'assistant';
                const isStreamingMessage = isStreaming && isLastAssistantMessage;

                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={isStreamingMessage}
                    onFeedback={handleFeedback}
                  />
                );
              })}

              {/* Typing indicator quando agente está processando */}
              {isLoading && messages.length > 0 && messages[messages.length - 1]?.type !== 'assistant' && (
                <TypingIndicator />
              )}

              {/* Typing indicator ao iniciar conversa */}
              {isLoading && messages.length === 0 && <TypingIndicator />}

              {/* Mensagens de erro */}
              {error && <ErrorMessage message={error} />}

              {/* Âncora para scroll automático */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Botão Scroll to Bottom com badge de novas mensagens */}
          {showNewMessageBadge && (
            <button
              onClick={scrollToBottom}
              className="fixed bottom-24 sm:bottom-28 right-6 sm:right-8 z-20 p-3 bg-white dark:bg-dark-card border-2 border-primary-500 dark:border-primary-400 rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 group"
              aria-label={`${newMessageCount} nova${newMessageCount > 1 ? 's' : ''} mensagem${newMessageCount > 1 ? 'ns' : ''}`}
            >
              {/* Badge com contagem */}
              {newMessageCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[24px] h-6 px-1.5 bg-primary-600 dark:bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {newMessageCount > 9 ? '9+' : newMessageCount}
                </span>
              )}
              <ArrowDown className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-y-0.5 transition-transform" />
            </button>
          )}

          {/* Input de mensagens - Fixo no Bottom */}
          <div className="flex-shrink-0 bg-gradient-to-t from-primary-50 dark:from-dark-bg to-transparent px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
            <ChatInput
              onSendMessage={sendMessage}
              onStopGeneration={stopGeneration}
              isLoading={isLoading}
              isStreaming={isStreaming}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;