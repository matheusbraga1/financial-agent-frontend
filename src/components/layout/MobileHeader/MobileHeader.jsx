import { Menu, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../../common';
import logo from '../../../assets/img/financial-logo.png';

/**
 * Mobile Header Premium da Financial
 * - Design profissional com cores da marca
 * - Verde #00884f e Dourado #bf9c4b
 * - Totalmente responsivo
 * - Animações e microinterações
 * - Backdrop blur para efeito glassmorphism
 */
const MobileHeader = ({ onToggleSidebar }) => {
  return (
    <header className="
      lg:hidden
      sticky top-0 z-30
      bg-white/95 dark:bg-dark-card/95
      backdrop-blur-md
      border-b border-gray-200/80 dark:border-dark-border/80
      shadow-sm
      transition-all duration-200
    ">
      {/* Gradiente sutil de fundo */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-50/30 via-transparent to-secondary-50/30 dark:from-primary-900/10 dark:via-transparent dark:to-secondary-900/10 pointer-events-none" />

      <div className="relative px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
        {/* Botão Menu com efeito ripple */}
        <button
          onClick={onToggleSidebar}
          className="
            relative overflow-hidden
            p-2.5 min-w-[44px] min-h-[44px]
            text-gray-700 dark:text-gray-300
            hover:text-primary-700 dark:hover:text-primary-400
            hover:bg-primary-50 dark:hover:bg-primary-900/20
            rounded-xl
            transition-all duration-200 ease-out
            active:scale-95
            group
            touch-manipulation
          "
          aria-label="Abrir menu"
        >
          {/* Efeito ripple */}
          <span className="absolute inset-0 bg-primary-500/10 scale-0 group-active:scale-100 rounded-xl transition-transform duration-300" />

          <Menu className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:rotate-180 transition-transform duration-300" />
        </button>

        {/* Logo e Título Centralizados com gradiente premium */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-2.5">
          {/* Container do logo com sombra e gradiente */}
          <div className="
            relative
            w-8 h-8 sm:w-9 sm:h-9
            rounded-xl
            bg-gradient-to-br from-primary-600 via-primary-500 to-primary-600
            dark:from-primary-500 dark:via-primary-400 dark:to-primary-500
            flex items-center justify-center
            p-1.5
            shadow-lg shadow-primary-500/30 dark:shadow-primary-900/40
            ring-2 ring-primary-100 dark:ring-primary-900/50
            animate-subtle-glow
          ">
            {/* Brilho interno */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-xl" />

            <img
              src={logo}
              alt="Financial"
              className="w-full h-full object-contain relative z-10"
            />
          </div>

          {/* Título com gradiente */}
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 dark:from-primary-400 dark:via-primary-300 dark:to-primary-400 bg-clip-text text-transparent whitespace-nowrap">
              Financial
            </h1>
            <p className="text-[9px] sm:text-[10px] font-medium text-secondary-600 dark:text-secondary-400 -mt-0.5 whitespace-nowrap flex items-center gap-1">
              <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
              <span>Agente IA</span>
            </p>
          </div>
        </div>

        {/* Theme Toggle com espaçamento adequado para touch */}
        <div className="flex items-center min-w-[44px] justify-end">
          <ThemeToggle />
        </div>
      </div>

      {/* Linha de progresso/destaque sutil no bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-500/20 to-transparent dark:via-primary-400/20" />
    </header>
  );
};

export default MobileHeader;
