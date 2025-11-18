import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
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
 * Interface principal do chat - Estilo Claude
 * - Layout centralizado quando vazio (como Claude)
 * - Transição suave para layout de mensagens
 * - Input centralizado no estado vazio
 * - Scroll inteligente
 * - Design profissional e responsivo
 */
const ChatInterface = ({ sessionId, forceNewConversation, onSessionCreated, onFirstMessage }) => {
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

  // Ref para armazenar callbacks sem causar re-renders
  const onSessionCreatedRef = useRef(onSessionCreated);
  const onFirstMessageRef = useRef(onFirstMessage);
  // Ref para rastrear se já notificou a primeira mensagem
  const hasNotifiedFirstMessageRef = useRef(new Set());

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

  // Atualiza refs quando callbacks mudam
  useEffect(() => {
    onSessionCreatedRef.current = onSessionCreated;
  }, [onSessionCreated]);

  useEffect(() => {
    onFirstMessageRef.current = onFirstMessage;
  }, [onFirstMessage]);

  /**
   * Notifica sobre primeira mensagem do usuário em nova sessão
   * Usado para adicionar conversa ao histórico com efeito de digitação
   */
  useEffect(() => {
    if (!currentSessionId || !messages.length) return;

    // Evita notificar múltiplas vezes para mesma sessão
    if (hasNotifiedFirstMessageRef.current.has(currentSessionId)) {
      return;
    }

    // Procura primeira mensagem do usuário
    const firstUserMessage = messages.find(msg => msg.type === 'user');

    if (firstUserMessage && firstUserMessage.content) {
      // Marca como notificada
      hasNotifiedFirstMessageRef.current.add(currentSessionId);

      // Notifica o componente pai
      onFirstMessageRef.current?.(currentSessionId, firstUserMessage.content);
    }
  }, [messages, currentSessionId]);

  /**
   * Notifica componente pai quando session_id muda
   * Usa ref para evitar loops infinitos causados por callback recriado
   */
  useEffect(() => {
    if (currentSessionId && currentSessionId !== sessionId) {
      onSessionCreatedRef.current?.(currentSessionId);
    }
  }, [currentSessionId, sessionId]); // onSessionCreated removido das dependências!

  /**
   * REMOVIDO: Carregamento duplicado de histórico
   * O hook useChat já carrega o histórico automaticamente quando initialSessionId muda
   * Este useEffect estava causando requisições duplicadas ao backend
   */

  /**
   * Cria nova conversa quando solicitado
   * clearMessages é memoizado, então é seguro usar como dependência
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
      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-dark-bg overflow-hidden relative">
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
    <div className="flex flex-col h-full min-h-screen bg-gray-50 dark:bg-dark-bg relative">
      {isEmpty ? (
        /* Layout Centralizado - Claude Style: Logo + Título + Input juntos no centro */
        <div className="flex flex-col h-full min-h-screen animate-fade-in">
          {/* Tudo centralizado verticalmente */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 overflow-y-auto">
            <div className="flex flex-col items-center w-full max-w-2xl space-y-8 sm:space-y-10">
              {/* Logo + Título */}
              <EmptyState />

              {/* Input centralizado */}
              <div className="w-full">
                <ChatInput
                  onSendMessage={sendMessage}
                  onStopGeneration={stopGeneration}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Layout Normal - Com Mensagens */
        <div className="flex flex-col h-full min-h-screen">
          {/* Container de mensagens - Responsivo com scroll inteligente */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 scroll-smooth animate-fade-in"
          >
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-4">
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

          {/* Input de mensagens - Flutuante no Bottom */}
          <div className="flex-shrink-0 px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 pb-safe">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                onSendMessage={sendMessage}
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
  forceNewConversation: PropTypes.bool,
  onSessionCreated: PropTypes.func,
  onFirstMessage: PropTypes.func,
};

ChatInterface.defaultProps = {
  sessionId: null,
  forceNewConversation: false,
  onSessionCreated: null,
  onFirstMessage: null,
};

export default ChatInterface;
