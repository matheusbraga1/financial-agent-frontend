import { AlertCircle, AlertTriangle, XCircle, WifiOff, RefreshCw, X } from 'lucide-react';
import { useState } from 'react';
import { formatFullErrorMessage } from '../../../constants/errorMessages';

/**
 * ErrorDisplay Premium da Financial
 * Componente profissional para exibir mensagens de erro
 *
 * @param {Object|string} error - Objeto de erro ou string
 * @param {'inline'|'card'|'banner'|'modal'} variant - Estilo de exibição
 * @param {'error'|'warning'|'network'} type - Tipo de erro
 * @param {Function} onRetry - Callback para tentar novamente
 * @param {Function} onDismiss - Callback para fechar
 * @param {boolean} dismissible - Se pode ser fechado
 */
const ErrorDisplay = ({
  error,
  variant = 'card',
  type = 'error',
  onRetry = null,
  onDismiss = null,
  dismissible = true,
  className = '',
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const { title, message, suggestion } = formatFullErrorMessage(error);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Configurações por tipo
  const typeConfig = {
    error: {
      icon: XCircle,
      bgColor: 'from-red-600 to-red-500 dark:from-red-500 dark:to-red-400',
      bgLight: 'bg-red-50 dark:bg-red-900/10',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'from-yellow-600 to-yellow-500 dark:from-yellow-500 dark:to-yellow-400',
      bgLight: 'bg-yellow-50 dark:bg-yellow-900/10',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    network: {
      icon: WifiOff,
      bgColor: 'from-blue-600 to-blue-500 dark:from-blue-500 dark:to-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-900/10',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  };

  const config = typeConfig[type] || typeConfig.error;
  const Icon = config.icon;

  // Variant: Inline (compacto, uma linha)
  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm ${config.textColor} ${className}`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  // Variant: Banner (topo da página)
  if (variant === 'banner') {
    return (
      <div className={`w-full ${config.bgLight} border-b ${config.borderColor} ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${config.textColor}`}>{title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-dark-card text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-hover transition-all duration-200 border border-gray-300 dark:border-dark-border flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tentar novamente</span>
                </button>
              )}

              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="p-1.5 hover:bg-white/50 dark:hover:bg-dark-hover rounded-lg transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant: Modal
  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
        <div
          className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-md w-full overflow-hidden"
          style={{ animation: "scaleIn 200ms ease-out" }}
        >
          {/* Header com gradiente */}
          <div className={`bg-gradient-to-r ${config.bgColor} p-6 text-white`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {message}
            </p>

            {suggestion && (
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg border-l-4 border-primary-500">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  💡 Sugestão
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {suggestion}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white rounded-xl hover:from-primary-700 hover:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-500 transition-all duration-200 font-medium shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Tentar novamente</span>
                </button>
              )}

              {dismissible && (
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 font-medium"
                >
                  Fechar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant: Card (padrão)
  return (
    <div className={`${config.bgLight} border ${config.borderColor} rounded-xl p-4 sm:p-5 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${config.bgColor} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm sm:text-base font-semibold ${config.textColor} mb-1`}>
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {message}
              </p>
            </div>

            {dismissible && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-dark-hover rounded-lg transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>

          {suggestion && (
            <div className="mt-3 p-2 sm:p-3 bg-white dark:bg-dark-card rounded-lg border border-gray-200 dark:border-dark-border">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Sugestão
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {suggestion}
              </p>
            </div>
          )}

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white text-sm font-medium rounded-lg hover:from-primary-700 hover:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-500 transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tentar novamente</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
