const Skeleton = ({ className = '', variant = 'default' }) => {
  const variantStyles = {
    default: 'bg-gray-200 dark:bg-gray-700',
    text: 'bg-gray-200 dark:bg-gray-700 h-4 rounded',
    title: 'bg-gray-300 dark:bg-gray-600 h-6 rounded',
    circle: 'bg-gray-200 dark:bg-gray-700 rounded-full',
    avatar: 'bg-gray-300 dark:bg-gray-600 rounded-full w-10 h-10',
  };

  return (
    <div
      className={`animate-pulse ${variantStyles[variant]} ${className}`}
      aria-label="Carregando..."
    />
  );
};

export default Skeleton;
