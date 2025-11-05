import { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SourcesList from '../SourcesList';
import { MESSAGE_TYPES, AGENT_NAME } from '../../constants/chatConstants';

const ChatMessage = ({ message }) => {
  const isUser = message?.type === MESSAGE_TYPES.USER;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message?.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 shadow-sm relative ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-white dark:bg-dark-card text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-dark-border'
        }`}
      >
        {/* Header: Avatar + Agent Name + Timestamp */}
        <div className="flex items-center justify-between gap-2 mb-1 text-xs opacity-70">
          <div className="flex items-center gap-2">
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            {!isUser && <span>{AGENT_NAME}</span>}
          </div>
          {message?.timestamp && (
            <span className="text-xs">{formatTimestamp(message.timestamp)}</span>
          )}
        </div>

        {/* Conteúdo */}
        <div className="prose prose-sm max-w-none break-words leading-relaxed">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: '0.75rem 0',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      padding: '1rem',
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className={`${isUser ? 'bg-primary-700/50' : 'bg-gray-200 dark:bg-dark-hover'} ${isUser ? 'text-white' : 'text-red-600 dark:text-red-400'} px-1.5 py-0.5 rounded text-sm font-mono font-medium`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc ml-5 mb-3 space-y-1.5">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal ml-5 mb-3 space-y-1.5">{children}</ol>;
              },
              li({ children }) {
                return <li className="leading-relaxed">{children}</li>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className={`border-l-4 pl-4 py-1 italic my-3 ${isUser ? 'border-primary-300 bg-primary-700/20' : 'border-primary-500 dark:border-primary-600 bg-gray-50 dark:bg-dark-hover/50'}`}>
                    {children}
                  </blockquote>
                );
              },
              h1({ children }) {
                return <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-bold mb-3 mt-4 first:mt-0">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>;
              },
              h4({ children }) {
                return <h4 className="text-sm font-semibold mb-2 mt-2 first:mt-0">{children}</h4>;
              },
              a({ children, href }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline font-medium ${isUser ? 'text-primary-100 hover:text-white' : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'}`}
                  >
                    {children}
                  </a>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full border border-gray-300 dark:border-dark-border rounded-lg overflow-hidden">{children}</table>
                  </div>
                );
              },
              thead({ children }) {
                return <thead className="bg-gray-100 dark:bg-dark-hover">{children}</thead>;
              },
              th({ children }) {
                return (
                  <th className="border border-gray-300 dark:border-dark-border px-4 py-2.5 font-semibold text-left text-sm">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return <td className="border border-gray-300 dark:border-dark-border px-4 py-2.5 text-sm">{children}</td>;
              },
              hr() {
                return <hr className="my-4 border-gray-300 dark:border-dark-border" />;
              },
              strong({ children }) {
                return <strong className="font-semibold">{children}</strong>;
              },
              em({ children }) {
                return <em className="italic">{children}</em>;
              },
            }}
          >
            {message?.content || ''}
          </ReactMarkdown>
        </div>

        {/* Botão Copy (aparece no hover) */}
        <button
          onClick={handleCopy}
          className={`absolute top-2 right-2 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 ${
            isUser
              ? 'bg-primary-700 hover:bg-primary-800'
              : 'bg-gray-100 dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-primary-900/30'
          }`}
          title={copied ? 'Copiado!' : 'Copiar mensagem'}
          aria-label="Copiar mensagem"
        >
          {copied ? (
            <Check className={`w-3.5 h-3.5 ${isUser ? 'text-white' : 'text-green-600'}`} />
          ) : (
            <Copy className={`w-3.5 h-3.5 ${isUser ? 'text-white' : 'text-gray-600'}`} />
          )}
        </button>

        {/* Sources */}
        {!isUser && message?.sources?.length > 0 && (
          <div className="mt-3">
            <SourcesList sources={message.sources} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;