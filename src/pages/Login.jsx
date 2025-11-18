import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { VALIDATION_ERRORS } from '../constants/errorMessages';
import logo from '../assets/img/financial-logo.png';
import {
  fadeInUp,
  logoEntrance,
  buttonHoverWithShadow,
  buttonTap,
  inputUnderline,
  staggerContainer,
  staggerItem,
} from '../utils/animations';

// Schema de validação com Zod e mensagens profissionais
const loginSchema = z.object({
  username: z
    .string()
    .min(1, VALIDATION_ERRORS.REQUIRED_FIELD)
    .min(3, VALIDATION_ERRORS.USERNAME_TOO_SHORT)
    .max(50, VALIDATION_ERRORS.USERNAME_TOO_LONG),
  password: z
    .string()
    .min(1, VALIDATION_ERRORS.REQUIRED_FIELD)
    .min(8, VALIDATION_ERRORS.PASSWORD_TOO_SHORT),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Se já estiver autenticado, redireciona para o dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    const result = await login(data.username, data.password);

    if (result.success) {
      // Redireciona para a página que o usuário tentou acessar, ou dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 dark:bg-dark-bg px-3 py-4 sm:px-4 sm:py-6 md:py-1">
      {/* Background mesh gradient animado */}
      <div className="fixed inset-0 bg-gradient-mesh dark:bg-gradient-mesh-dark opacity-60 sm:opacity-100" />

      {/* Floating blobs animados - Menores e mais discretos em mobile */}
      <motion.div
        className="fixed w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-primary-500/15 dark:bg-primary-500/8 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ top: '5%', left: '5%' }}
      />
      <motion.div
        className="fixed w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-secondary-500/15 dark:bg-secondary-500/8 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ bottom: '5%', right: '5%' }}
      />

      {/* Container principal - Otimizado para mobile */}
      <motion.div
        className="max-w-md w-full space-y-3 sm:space-y-4 md:space-y-1.5 relative z-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Logo e título - Mobile-first */}
        <motion.div className="text-center" variants={staggerItem}>
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-12 md:h-12 rounded-xl md:rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 mb-2 sm:mb-3 md:mb-1 ring-4 ring-primary-100/50 dark:ring-primary-900/30 p-2 sm:p-2.5 md:p-2 shadow-lg"
            variants={logoEntrance}
          >
            <img
              src={logo}
              alt="Financial"
              className="w-full h-full object-contain"
            />
          </motion.div>

          <motion.h2
            className="text-xl sm:text-2xl md:text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-500 px-2"
            variants={fadeInUp}
          >
            Bem-vindo de volta
          </motion.h2>

          <motion.p
            className="mt-1 sm:mt-1.5 md:mt-1 text-xs sm:text-sm md:text-sm text-gray-600 dark:text-gray-400 px-2"
            variants={fadeInUp}
          >
            Faça login para continuar
          </motion.p>
        </motion.div>

        {/* Card com Glassmorphism - Mobile optimized */}
        <motion.div
          className="
            bg-white/80 dark:bg-dark-card/80
            backdrop-blur-xl backdrop-saturate-150
            rounded-xl sm:rounded-2xl
            shadow-2xl shadow-black/10 dark:shadow-black/30
            border border-white/20 dark:border-white/10
            p-4 sm:p-6 md:p-5
            relative
            overflow-hidden
          "
          variants={staggerItem}
        >
          {/* Shimmer effect sutil no hover - desabilitado em mobile */}
          <div className="hidden sm:block absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 sm:space-y-4 md:space-y-2.5 relative">
            {/* Username - Mobile optimized */}
            <motion.div variants={staggerItem}>
              <label
                htmlFor="username"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1"
              >
                Usuário ou Email
              </label>
              <div className="relative">
                <motion.input
                  id="username"
                  type="text"
                  autoComplete="username"
                  {...register('username')}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-2 rounded-lg border text-base sm:text-base
                    ${
                      errors.username
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-dark-border focus:ring-primary-500 dark:focus:ring-primary-600'
                    }
                    bg-white/50 dark:bg-dark-bg/50
                    text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2
                    transition-all duration-200
                    backdrop-blur-sm
                  `}
                  placeholder="seu_usuario"
                />

                {/* Animated underline */}
                <AnimatePresence>
                  {focusedField === 'username' && !errors.username && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-700"
                      variants={inputUnderline}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    />
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                {errors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.username.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Senha - Mobile optimized */}
            <motion.div variants={staggerItem}>
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2 md:mb-1"
              >
                Senha
              </label>
              <div className="relative">
                <motion.input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className={`
                    w-full px-3 sm:px-4 py-2.5 sm:py-3 md:py-2 rounded-lg border text-base sm:text-base
                    ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-dark-border focus:ring-primary-500 dark:focus:ring-primary-600'
                    }
                    bg-white/50 dark:bg-dark-bg/50
                    text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2
                    transition-all duration-200
                    pr-11 sm:pr-12
                    backdrop-blur-sm
                  `}
                  placeholder="••••••••"
                />

                {/* Botão mostrar/ocultar senha */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-200 touch-manipulation p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-dark-hover active:scale-95"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.div
                        key="hide"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="show"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>

                {/* Animated underline */}
                <AnimatePresence>
                  {focusedField === 'password' && !errors.password && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-700"
                      variants={inputUnderline}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                    />
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence mode="wait">
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-1 text-sm text-red-500"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Botão de submit - Mobile optimized com altura mínima para touch */}
            <motion.button
              type="submit"
              disabled={loading}
              variants={staggerItem}
              whileHover={!loading ? buttonHoverWithShadow : {}}
              whileTap={!loading ? buttonTap : {}}
              className="
                w-full flex items-center justify-center gap-2
                px-4 py-3 sm:py-3.5 text-base sm:text-base
                min-h-[48px] sm:min-h-[52px]
                bg-gradient-to-r from-primary-600 to-primary-700
                hover:from-primary-700 hover:to-primary-800
                text-white font-medium rounded-lg
                shadow-lg shadow-primary-500/30
                disabled:opacity-50 disabled:cursor-not-allowed
                disabled:shadow-none
                touch-manipulation
                relative overflow-hidden
                transition-all duration-200
                mt-3 sm:mt-4 md:mt-1.5
              "
            >
              {/* Shimmer effect no botão */}
              {!loading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{
                    x: '100%',
                    transition: { duration: 0.6, ease: 'linear' }
                  }}
                />
              )}

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Entrando...
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                    Entrar
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Link para registro - Touch-friendly */}
          <motion.div
            className="mt-3 sm:mt-4 md:mt-1.5 text-center"
            variants={staggerItem}
          >
            <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors relative group inline-block py-1"
              >
                Criar conta
                <span className="hidden sm:inline absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Footer - Mobile optimized */}
        <motion.p
          className="text-center text-xs sm:text-xs text-gray-500 dark:text-gray-500 px-2"
          variants={staggerItem}
        >
          Financial Imobiliária © {new Date().getFullYear()}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
