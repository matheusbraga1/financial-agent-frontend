import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { VALIDATION_ERRORS } from '../constants/errorMessages';
import logo from '../assets/img/financial-logo.png';

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
    .min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg px-4 py-8 sm:py-12">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        {/* Logo e título - Responsivo */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 mb-3 sm:mb-4 ring-4 ring-primary-100 dark:ring-primary-900/30 p-2.5 sm:p-3">
            <img
              src={logo}
              alt="Financial"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-500">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Faça login para continuar
          </p>
        </div>

        {/* Formulário - Responsivo */}
        <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl border border-gray-100 dark:border-dark-border p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Usuário ou Email
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                {...register('username')}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
                  errors.username
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 dark:border-dark-border focus:ring-primary-500 dark:focus:ring-primary-600'
                } bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors`}
                placeholder="seu_usuario"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border text-sm sm:text-base ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-dark-border focus:ring-primary-500 dark:focus:ring-primary-600'
                  } bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors pr-11 sm:pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors touch-manipulation"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Botão de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary-600 disabled:hover:to-primary-700 touch-manipulation"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Link para registro */}
          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-500">
          Financial Imobiliária © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;
