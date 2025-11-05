import { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { AlertCircle, Loader2 } from 'lucide-react';

const ChatInterface = () => {
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bem-vindo ao Chat IA GLPI!
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Faça perguntas sobre procedimentos de TI, configurações de sistemas e 
                outros tópicos da base de conhecimento.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => sendMessage("Como resetar minha senha do email?")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Como resetar senha do email?
                </button>
                <button
                  onClick={() => sendMessage("Como configurar a VPN?")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Como configurar VPN?
                </button>
                <button
                  onClick={() => sendMessage("Como solicitar novo equipamento?")}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Solicitar equipamento
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Processando...</span>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Erro ao processar mensagem</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input de mensagem */}
      <div className="border-t bg-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <ChatInput 
            onSendMessage={sendMessage} 
            isLoading={isLoading}
            onClear={clearMessages}
            hasMessages={messages.length > 0}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;