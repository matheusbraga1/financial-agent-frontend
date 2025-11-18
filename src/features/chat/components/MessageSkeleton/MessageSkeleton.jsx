/**
 * MessageSkeleton - Skeleton screen para mensagens sendo carregadas
 * Melhora percepção de performance durante carregamento
 */
const MessageSkeleton = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse w-full max-w-3xl" role="status" aria-label="Carregando mensagens">
          {/* Header skeleton */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-700 rounded" />
            <div className="w-32 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-600 rounded" />
            <div className="w-4/6 h-4 bg-gray-200 dark:bg-gray-600 rounded" />
          </div>

          {/* Spacer */}
          {index < count - 1 && <div className="h-6" />}
        </div>
      ))}
    </>
  );
};

export default MessageSkeleton;
