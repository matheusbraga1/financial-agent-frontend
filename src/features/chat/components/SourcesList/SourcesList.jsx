import { FileText } from 'lucide-react';

/**
 * SourcesList - Lista de fontes consultadas
 * Ícone com tooltip - não ocupa espaço vertical
 */
const SourcesList = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="relative inline-block group/sources">
      <button
        type="button"
        className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
        aria-label={`${sources.length} fontes consultadas`}
      >
        <FileText className="w-3.5 h-3.5" />
      </button>

      {/* Tooltip com fontes */}
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover/sources:block z-50 animate-fade-in">
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg p-3 min-w-[200px] max-w-[300px]">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Fontes consultadas
          </p>
          <div className="space-y-1.5">
            {sources.map((source, index) => (
              <div
                key={source.id || index}
                className="text-xs text-gray-700 dark:text-gray-300"
              >
                <span className="font-medium">
                  {source.title || source.document_name || `Fonte ${index + 1}`}
                </span>
                {(source.score || source.relevance_score) && (
                  <span className="text-gray-400 dark:text-gray-500 ml-1">
                    ({((source.score || source.relevance_score) * 100).toFixed(0)}%)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Seta do tooltip */}
        <div className="absolute left-3 -bottom-1 w-2 h-2 bg-white dark:bg-dark-card border-r border-b border-gray-200 dark:border-dark-border transform rotate-45" />
      </div>
    </div>
  );
};

export default SourcesList;
