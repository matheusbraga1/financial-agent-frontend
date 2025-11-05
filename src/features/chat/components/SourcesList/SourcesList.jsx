import { FileText, Tag } from 'lucide-react';

const SourcesList = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-600 flex items-center gap-1">
        <FileText className="w-3 h-3" />
        Fontes consultadas:
      </p>
      <div className="space-y-1.5">
        {sources.map((source, index) => (
          <div
            key={source.id}
            className="flex items-start gap-2 p-2.5 bg-gradient-to-br from-gray-50 to-primary-50/30 border border-gray-200 rounded-lg text-xs hover:border-primary-300 hover:shadow-sm transition-all"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-xs font-medium shadow-sm">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {source.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-secondary-100 to-secondary-50 border border-secondary-200 rounded-md text-secondary-800 font-medium">
                  <Tag className="w-3 h-3" />
                  {source.category}
                </span>
                <span className="text-primary-600 font-medium">
                  {(source.score * 100).toFixed(0)}% relevante
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SourcesList;