// src/components/ChatMessage.jsx
import { Bot, User } from 'lucide-react';
import SourcesList from './SourceList';

const ChatMessage = ({ message }) => {
  const isUser = message?.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={[
          'max-w-[80%] rounded-lg p-3 shadow-sm',
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-900 border border-gray-200'
        ].join(' ')}
      >
        <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          {!isUser && message?.modelUsed ? <span>{message.modelUsed}</span> : null}
        </div>

        <div className="whitespace-pre-wrap break-words text-sm">
          {message?.content}
        </div>

        {!isUser && Array.isArray(message?.sources) && message.sources.length > 0 && (
          <div className="mt-3">
            <SourcesList sources={message.sources} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
