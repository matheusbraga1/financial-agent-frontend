import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton loading premium para histórico de conversas
 * - Shimmer animation profissional
 * - Estrutura idêntica ao ConversationItem
 * - Staggered animation delay para efeito cascata
 *
 * @component
 */
const HistorySkeleton = memo(({ count = 5 }) => {
  return (
    <div className="space-y-1.5" role="status" aria-label="Carregando histórico">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} delay={index * 100} />
      ))}
      <span className="sr-only">Carregando conversas...</span>
    </div>
  );
});

/**
 * Item individual do skeleton
 * Estrutura idêntica ao ConversationItem para consistência visual
 */
const SkeletonItem = memo(({ delay = 0 }) => (
  <div
    className="px-3 py-3 rounded-xl bg-gray-50 dark:bg-dark-hover/50"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start gap-3">
      {/* Icon skeleton */}
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Message text lines */}
        <div className="space-y-1.5">
          <div
            className="h-3.5 rounded-md skeleton-shimmer"
            style={{ width: `${85 + Math.random() * 15}%` }}
          />
          <div
            className="h-3.5 rounded-md skeleton-shimmer"
            style={{
              width: `${50 + Math.random() * 30}%`,
              animationDelay: '75ms',
            }}
          />
        </div>

        {/* Metadata skeleton */}
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 rounded skeleton-shimmer"
            style={{ width: '70px', animationDelay: '150ms' }}
          />
          <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div
            className="h-2.5 rounded skeleton-shimmer"
            style={{ width: '40px', animationDelay: '200ms' }}
          />
        </div>
      </div>
    </div>
  </div>
));

SkeletonItem.displayName = 'SkeletonItem';

HistorySkeleton.propTypes = {
  /** Número de itens skeleton a renderizar */
  count: PropTypes.number,
};

HistorySkeleton.displayName = 'HistorySkeleton';

export default HistorySkeleton;
