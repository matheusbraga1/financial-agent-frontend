import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

/**
 * Componente LoadingSpinner reutilizável
 */
const LoadingSpinner = ({ size = 'default', text = '', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-primary-600 dark:text-primary-400`}
      />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'default', 'large']),
  text: PropTypes.string,
  className: PropTypes.string,
};

export default LoadingSpinner;
