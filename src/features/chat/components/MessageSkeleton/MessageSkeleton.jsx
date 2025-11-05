import { Skeleton } from '../../../../components/common';

const MessageSkeleton = () => (
  <div className="flex justify-start animate-fade-in">
    <div className="max-w-[80%] rounded-lg p-3 shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
      {/* Header skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton variant="circle" className="w-4 h-4" />
        <Skeleton variant="text" className="w-20" />
      </div>

      {/* Content skeleton - 3 lines */}
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-4/6" />
      </div>
    </div>
  </div>
);

export default MessageSkeleton;
