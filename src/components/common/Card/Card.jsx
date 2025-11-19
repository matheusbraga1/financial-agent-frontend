import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * Componente Card reutilizável com glassmorphism
 * Segue as boas práticas de componentes reutilizáveis
 */
const Card = ({
  children,
  title,
  subtitle,
  className = '',
  variant = 'default',
  hover = false,
  padding = 'default',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    small: 'p-4',
    default: 'p-6',
    large: 'p-8',
  };

  const variantClasses = {
    default: 'bg-white/80 dark:bg-dark-card/80',
    primary: 'bg-primary-50/80 dark:bg-primary-900/20',
    secondary: 'bg-secondary-50/80 dark:bg-secondary-900/20',
    gradient: 'bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-dark-card/90 dark:to-dark-bg/90',
  };

  return (
    <motion.div
      className={`
        ${variantClasses[variant]}
        backdrop-blur-xl backdrop-saturate-150
        rounded-xl
        shadow-lg shadow-black/5 dark:shadow-black/20
        border border-white/20 dark:border-white/10
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 transition-shadow duration-300' : ''}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'primary', 'secondary', 'gradient']),
  hover: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'small', 'default', 'large']),
};

export default Card;
