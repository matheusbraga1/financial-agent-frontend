import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 bg-gray-200 dark:bg-dark-hover rounded-full p-1 transition-colors duration-300 focus:outline-none"
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {/* Track background gradient */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-300 dark:from-primary-900 dark:to-primary-800 opacity-50 transition-opacity duration-300" />

      {/* Slider button */}
      <div
        className={`relative w-6 h-6 bg-white dark:bg-dark-card rounded-full shadow-md transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
          isDark ? 'translate-x-8' : 'translate-x-0'
        }`}
      >
        {/* Icon */}
        {isDark ? (
          <Moon className="w-4 h-4 text-primary-400 transition-all duration-300" />
        ) : (
          <Sun className="w-4 h-4 text-yellow-500 transition-all duration-300" />
        )}
      </div>

      {/* Decorative icons on track */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun className={`w-3 h-3 text-yellow-600 transition-opacity duration-300 ${isDark ? 'opacity-30' : 'opacity-0'}`} />
        <Moon className={`w-3 h-3 text-primary-300 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-30'}`} />
      </div>
    </button>
  );
};

export default ThemeToggle;
