import { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, MessageCircle } from 'lucide-react';
import { useMessageActions } from '../../hooks';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SourcesList from '../SourcesList';
import ThinkingIndicator from '../ThinkingIndicator';
import { MESSAGE_TYPES, AGENT_NAME } from '../../constants/chatConstants';

const ChatMessage = memo(({ message, isStreaming = false, onFeedback, feedbackState }) => {
  const isUser = message?.type === MESSAGE_TYPES.USER;
  const { copied, handleCopy } = useMessageActions(message);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentTone, setCommentTone] = useState('negative');

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

  const processMarkdown = (text) => {
    if (!text) return '';

    let processed = text;

    // Detectar se jÃ¡ tem quebras de linha adequadas
    const hasLineBreaks = text.includes('\n');

    if (!hasLineBreaks) {
      // Se nÃ£o tem quebras de linha, adicionar onde necessÃ¡rio

      // Adicionar quebra de linha antes e depois de headings (##, ###, etc)
      processed = processed.replace(/(#{1,6}\s)/g, '\n\n$1');
      processed = processed.replace(/(#{1,6}\s[^\n]+?)(\s+)(#{1,6}\s|$)/g, '$1\n\n$3');

      // Adicionar quebra antes de listas numeradas
      processed = processed.replace(/([.!?:])\s+(\d+\.\s)/g, '$1\n\n$2');

      // Adicionar quebra antes de listas nÃ£o ordenadas (â€¢)
      processed = processed.replace(/([.!?:])\s+(•\s)/g, '$1\n\n$2');

      // Adicionar quebra antes de blockquotes (>)
      processed = processed.replace(/([.!?])\s+(>\s)/g, '$1\n\n$2');

      // Adicionar quebra antes de horizontal rules (---)
      processed = processed.replace(/([^\n])(---)/g, '$1\n\n$2');
      processed = processed.replace(/(---)/g, '$1\n\n');
    }

    // Sempre limpar mÃºltiplas quebras consecutivas
    processed = processed.replace(/\n{3,}/g, '\n\n');

    return processed.trim();
  };

  const renderMarkdownContent = (content) => {
    if (!content) return null;

    const processedContent = processMarkdown(content);

    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: '1rem 0',
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
              className={`${isUser ? 'bg-primary-700/50' : 'bg-gray-200 dark:bg-gray-700'} ${isUser ? 'text-white' : 'text-red-600 dark:text-red-400'} px-1.5 py-0.5 rounded font-mono text-[0.9em]`}
              {...props}
            >
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="mb-4 last:mb-0 leading-relaxed text-sm">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc pl-8 mb-4 space-y-2 text-sm">{children}</ul>;
        },
        ol({ children, start }) {
          return <ol start={start} className="list-decimal pl-8 mb-4 space-y-2 text-sm">{children}</ol>;
        },
        li({ children, className, ...props }) {
          const isTaskItem = className?.includes('task-list-item');
          return (
            <li
              className={`leading-relaxed font-normal ${isTaskItem ? 'list-none flex items-start gap-2' : ''}`}
              {...props}
            >
              {children}
            </li>
          );
        },
        input({ type, checked, disabled, ...props }) {
          if (type === 'checkbox') {
            return (
              <input
                type="checkbox"
                checked={checked}
                disabled
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...props}
              />
            );
          }
          return <input type={type} checked={checked} disabled={disabled} {...props} />;
        },
        blockquote({ children }) {
          return (
            <blockquote className={`border-l-4 pl-4 py-2 my-4 ${isUser ? 'border-primary-300 bg-primary-700/20' : 'border-primary-400 dark:border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 rounded-r-md'}`}>
              <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {children}
              </div>
            </blockquote>
          );
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0 text-gray-900 dark:text-gray-100">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-semibold mb-3 mt-5 first:mt-0 text-gray-900 dark:text-gray-100">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-base font-semibold mb-3 mt-4 first:mt-0 text-gray-900 dark:text-gray-100">{children}</h3>;
        },
        h4({ children }) {
          return <h4 className="text-sm font-semibold mb-2 mt-3 first:mt-0 text-gray-900 dark:text-gray-100">{children}</h4>;
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline font-medium hover:no-underline ${isUser ? 'text-primary-100 hover:text-white' : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'}`}
            >
              {children}
            </a>
          );
        },
        table({ children }) {
          return (
            <div className="overflow-x-auto my-4">
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
          return <strong className="font-bold text-gray-900 dark:text-gray-100">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic">{children}</em>;
        },
      }}
    >
      {processedContent}
    </ReactMarkdown>
    );
  };

  const handleFeedbackClick = async (value) => {
    if (!message?.messageId || !onFeedback) return;
    await onFeedback(message.messageId, value);
  };

  const handleCommentSubmit = async () => {
    if (!commentText?.trim() || !message?.messageId || !onFeedback) return;
    await onFeedback(message.messageId, commentTone, commentText.trim());
    setCommentText('');
    setIsCommentOpen(false);
  };

  // Mensagem do usuÃ¡rio - com balÃ£o
  if (isUser) {
    return (
      <div className="group flex justify-end animate-fade-in">
        <div className="max-w-[80%] rounded-lg p-3 shadow-sm relative bg-primary-600 text-white">
          {/* Header: Avatar + Timestamp */}
          <div className="flex items-center justify-between gap-2 mb-1 text-xs opacity-70">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
            </div>
            {message?.timestamp && (
              <span className="text-xs">{formatTimestamp(message.timestamp)}</span>
            )}
          </div>

          {/* ConteÃºdo */}
          <div className="max-w-none break-words">
            {renderMarkdownContent(message?.content)}
          </div>

          {/* BotÃ£o Copy */}
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 bg-primary-700 hover:bg-primary-800"
            title={copied ? 'Copiado!' : 'Copiar mensagem'}
            aria-label="Copiar mensagem"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-white" />
            )}
          </button>
        </div>
      </div>
    );
  }

    // Mensagem do agente - sem balão, estilo Claude
  return (
    <div className="group flex justify-start animate-fade-in w-full">
      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
          <Bot className="w-4 h-4" />
          <span className="font-medium">{AGENT_NAME}</span>
          {message?.timestamp && (
            <>
              <span>&bull;</span>
              <span>{formatTimestamp(message.timestamp)}</span>
            </>
          )}
        </div>

        <div className="relative">
          <div className="max-w-none break-words text-gray-900 dark:text-gray-100">
            {message?.content ? (
              <>
                {renderMarkdownContent(message.content)}
                {isStreaming && (
                  <span className="inline-block w-1.5 h-5 bg-primary-600 dark:bg-primary-500 ml-0.5 animate-blink align-middle" />
                )}
              </>
            ) : (
              <ThinkingIndicator />
            )}
          </div>

          {/* Botão copiar - só aparece quando há conteúdo */}
          {message?.content && (
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 bg-gray-100 dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-primary-900/30"
              title={copied ? 'Copiado!' : 'Copiar mensagem'}
              aria-label="Copiar mensagem"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          )}
        </div>

        {(message?.sources?.length > 0 || (message?.messageId && onFeedback)) && (
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center gap-1">
              {/* Ícone de fontes consultadas */}
              {message?.sources?.length > 0 && <SourcesList sources={message.sources} />}

              {/* Botões de feedback */}
              {message?.messageId && onFeedback && (
                <>
              <button
                type="button"
                disabled={feedbackState?.submitting}
                onClick={() => handleFeedbackClick('positive')}
                className={`p-2 rounded-md transition-colors ${
                  feedbackState?.value === 'positive'
                    ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
                title="Útil"
                aria-label="Resposta útil"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>

              <button
                type="button"
                disabled={feedbackState?.submitting}
                onClick={() => handleFeedbackClick('negative')}
                className={`p-2 rounded-md transition-colors ${
                  feedbackState?.value === 'negative'
                    ? 'text-red-600 bg-red-50 dark:bg-red-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
                title="Melhorar"
                aria-label="Resposta precisa melhorar"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsCommentOpen((prev) => !prev)}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                title="Adicionar comentário"
                aria-label="Adicionar comentário"
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              {feedbackState?.submitted && (
                <span className="ml-auto text-xs text-primary-600 dark:text-primary-400 font-medium">
                  ✓ Obrigado!
                </span>
              )}
              {feedbackState?.error && (
                <span className="ml-auto text-xs text-red-600 dark:text-red-400">
                  Erro
                </span>
              )}
                </>
              )}
            </div>

            {isCommentOpen && message?.messageId && onFeedback && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <label className="font-medium text-gray-600 dark:text-gray-300">
                    Tom:
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`px-2 py-0.5 rounded ${
                        commentTone === 'positive'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                          : 'bg-gray-100 text-gray-600 dark:bg-dark-hover dark:text-gray-300'
                      }`}
                      onClick={() => setCommentTone('positive')}
                    >
                      Positivo
                    </button>
                    <button
                      type="button"
                      className={`px-2 py-0.5 rounded ${
                        commentTone === 'negative'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30'
                          : 'bg-gray-100 text-gray-600 dark:bg-dark-hover dark:text-gray-300'
                      }`}
                      onClick={() => setCommentTone('negative')}
                    >
                      Negativo
                    </button>
                  </div>
                </div>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-bg text-sm text-gray-800 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-500/40"
                  placeholder="Compartilhe detalhes para aprimorarmos as respostas..."
                />
                <div className="flex justify-end gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCommentOpen(false);
                      setCommentText('');
                    }}
                    className="px-3 py-1.5 rounded-md border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!commentText.trim()}
                    onClick={handleCommentSubmit}
                    className="px-3 py-1.5 rounded-md bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Memo comparison: só re-renderiza se essas props mudarem
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.isStreaming === nextProps.isStreaming &&
    prevProps.feedbackState === nextProps.feedbackState
  );
});

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    content: PropTypes.string,
    timestamp: PropTypes.string,
    sources: PropTypes.arrayOf(
      PropTypes.shape({
        document_name: PropTypes.string,
        page_number: PropTypes.number,
        relevance_score: PropTypes.number,
      })
    ),
  }).isRequired,
  isStreaming: PropTypes.bool,
  onFeedback: PropTypes.func,
  feedbackState: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;

