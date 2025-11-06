import { useState } from 'react';
import { FileText, Tag, ChevronDown, ChevronUp } from 'lucide-react';

const SourcesList = ({ sources }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-dark-border pt-4">
      {/* Header colapsável */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 dark:bg-dark-hover hover:bg-gray-100 dark:hover:bg-dark-card rounded-lg transition-colors text-left group"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {sources.length} {sources.length === 1 ? 'fonte consultada' : 'fontes consultadas'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {isExpanded ? 'Ocultar' : 'Ver detalhes'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </button>

      {/* Lista de fontes (colapsável) */}
      {isExpanded && (
        <div className="mt-3 space-y-2 animate-fade-in">
          {sources.map((source, index) => (
            <div
              key={source.id || index}
              className="flex items-start gap-3 p-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-sm hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-sm transition-all"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-xs font-semibold shadow-sm">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1.5">
                  {source.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary-50 dark:bg-secondary-900/30 border border-secondary-200 dark:border-secondary-700 rounded-md text-secondary-700 dark:text-secondary-300 text-xs font-medium">
                    <Tag className="w-3 h-3" />
                    {source.category}
                  </span>
                  <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                    {(source.score * 100).toFixed(0)}% relevante
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SourcesList;