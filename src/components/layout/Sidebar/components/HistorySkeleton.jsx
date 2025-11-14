import { memo } from 'react';

/**
 * Skeleton loading para histórico de conversas
 * - Animação de pulso suave
 * - Design premium
 */
const HistorySkeleton = memo(({ count = 5 }) => {
  return (
    <div className="space-y-1.5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="px-3 py-3 rounded-xl bg-gray-100 dark:bg-dark-hover animate-pulse"
          style={{
            animationDelay: `${index * 75}ms`,
          }}
        >
          <div className="flex items-start gap-3">
            {/* Icon skeleton */}
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

            {/* Content skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Title line */}
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />

              {/* Metadata */}
              <div className="flex items-center gap-2">
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-12" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

HistorySkeleton.displayName = 'HistorySkeleton';

export default HistorySkeleton;
