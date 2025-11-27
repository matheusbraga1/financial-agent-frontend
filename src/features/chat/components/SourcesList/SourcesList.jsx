import { FileText } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * SourcesList - Exibição discreta de fonte consultada
 *
 * Design minimalista e profissional que mostra a primeira fonte
 * de forma inline, sem modal, focando em UX clean.
 *
 * @component
 * @param {Array} sources - Lista de fontes consultadas
 */
const SourcesList = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  const source = sources[0];
  const documentName = source.document_name || source.title || 'Documento de base';
  const relevanceScore = typeof source.relevance_score === 'number'
    ? source.relevance_score
    : null;

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-dark-hover/40 rounded-md border border-gray-200 dark:border-dark-border/60 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-dark-hover/60 hover:border-gray-300 dark:hover:border-dark-border max-w-fit"
      role="complementary"
      aria-label="Fonte consultada"
    >
      <FileText className="w-3 h-3 flex-shrink-0 text-gray-400 dark:text-gray-500" aria-hidden="true" />

      <span className="truncate max-w-[280px] sm:max-w-md font-medium" title={documentName}>
        {documentName}
      </span>

      {relevanceScore !== null && (
        <>
          <span className="text-gray-300 dark:text-gray-600 select-none" aria-hidden="true">•</span>
          <span className="text-gray-500 dark:text-gray-500 font-medium whitespace-nowrap tabular-nums">
            {(relevanceScore * 100).toFixed(0)}%
          </span>
        </>
      )}
    </div>
  );
};

SourcesList.propTypes = {
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      document_name: PropTypes.string,
      title: PropTypes.string,
      relevance_score: PropTypes.number,
      page_number: PropTypes.number,
      chunk_id: PropTypes.string,
    })
  ),
};

SourcesList.defaultProps = {
  sources: [],
};

export default SourcesList;
