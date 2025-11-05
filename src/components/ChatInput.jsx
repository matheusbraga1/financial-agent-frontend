import { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading, onClear, hasMessages }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    // Enviar com Enter, quebra de linha com Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      {/* Botão Limpar */}
      {hasMessages && (
        <button
          type="button"
          onClick={onClear}
          disabled={isLoading}
          className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          title="Limpar conversa"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}

      {/* Input */}
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua pergunta... (Enter para enviar, Shift+Enter para quebrar linha)"
          disabled={isLoading}
          rows={1}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={{
            minHeight: '50px',
            maxHeight: '150px',
          }}
        />
        
        {/* Contador de caracteres */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {input.length}/1000
        </div>
      </div>

      {/* Botão Enviar */}
      <button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
        title="Enviar mensagem"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
};

export default ChatInput;