import { memo } from 'react';
import PropTypes from 'prop-types';
import { User } from 'lucide-react';
import { generateAvatarGradient, getAvatarInitial } from '../../../utils';

/**
 * Avatar do usuário com gradiente colorido
 * - Gera cor única baseada no username/email
 * - Mostra inicial do nome
 * - Tamanhos: xs, sm, md, lg, xl
 * - Suporta modo guest (sem usuário)
 *
 * @component
 */
const UserAvatar = memo(({ user, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-5 h-5 min-w-[20px] min-h-[20px] text-[10px]',
    sm: 'w-6 h-6 min-w-[24px] min-h-[24px] text-xs',
    md: 'w-8 h-8 min-w-[32px] min-h-[32px] text-sm',
    lg: 'w-10 h-10 min-w-[40px] min-h-[40px] text-base',
    xl: 'w-12 h-12 min-w-[48px] min-h-[48px] text-lg',
  };

  const iconSizes = {
    xs: 'w-2.5 h-2.5 min-w-[10px] min-h-[10px]',
    sm: 'w-3 h-3 min-w-[12px] min-h-[12px]',
    md: 'w-4 h-4 min-w-[16px] min-h-[16px]',
    lg: 'w-5 h-5 min-w-[20px] min-h-[20px]',
    xl: 'w-6 h-6 min-w-[24px] min-h-[24px]',
  };

  // Guest user
  if (!user) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-lg bg-gray-200 dark:bg-dark-hover flex items-center justify-center flex-shrink-0 ${className}`}
      >
        <User className={`${iconSizes[size]} text-gray-600 dark:text-gray-400`} />
      </div>
    );
  }

  // Authenticated user
  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm ${className}`}
      style={{ background: generateAvatarGradient(user?.username || user?.email || 'U') }}
    >
      {getAvatarInitial(user)}
    </div>
  );
});

UserAvatar.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
  }),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
};

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
