import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { GENERIC_ERRORS } from '../../../constants/errorMessages';

/**
 * ErrorBoundary Premium da Financial
 * Captura erros do React e exibe interface profissional de recuperação
 *
 * - Design profissional com cores da marca
 * - Animações suaves
 * - Opções de recuperação (reload, voltar ao início)
 * - Detalhes técnicos para debug (apenas em dev)
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Em produção, você pode enviar para um serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Exemplo: Sentry.captureException(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';
      const errorMessage = GENERIC_ERRORS.UNKNOWN;

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50/30 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg px-4 py-8">
          <div className="max-w-2xl w-full">
            {/* Card principal */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden animate-fade-in">
              {/* Header com gradiente */}
              <div className="bg-gradient-to-r from-red-600 to-red-500 dark:from-red-500 dark:to-red-400 p-8 text-white">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30 shadow-xl">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
                  {errorMessage.title}
                </h1>

                <p className="text-center text-white/90 text-sm sm:text-base">
                  {errorMessage.message}
                </p>
              </div>

              {/* Conteúdo */}
              <div className="p-8 space-y-6">
                {/* Sugestão */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 rounded-r-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1 flex items-center gap-2">
                    <Bug className="w-4 h-4" />
                    O que fazer agora?
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {errorMessage.suggestion || 'Tente recarregar a página ou voltar para a página inicial.'}
                  </p>
                </div>

                {/* Ações */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={this.handleReset}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-500 dark:to-primary-400 text-white font-medium rounded-xl hover:from-primary-700 hover:to-primary-600 dark:hover:from-primary-600 dark:hover:to-primary-500 transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Recarregar Página</span>
                  </button>

                  <button
                    onClick={this.handleGoHome}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <Home className="w-5 h-5" />
                    <span>Ir para Início</span>
                  </button>
                </div>

                {/* Detalhes técnicos (apenas em desenvolvimento ou se explicitamente habilitado) */}
                {(isDev || this.props.showDetails) && this.state.error && (
                  <details className="mt-6">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors select-none flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      Detalhes técnicos (apenas para desenvolvedores)
                    </summary>

                    <div className="mt-3 space-y-3">
                      {/* Erro */}
                      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-2">
                          Mensagem de Erro:
                        </p>
                        <pre className="text-xs text-red-900 dark:text-red-200 overflow-auto whitespace-pre-wrap break-words">
                          {this.state.error.toString()}
                        </pre>
                      </div>

                      {/* Stack trace */}
                      {this.state.errorInfo && (
                        <div className="bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Stack Trace:
                          </p>
                          <pre className="text-xs text-gray-800 dark:text-gray-400 overflow-auto whitespace-pre-wrap break-words max-h-64">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              {/* Footer com informação de contato (opcional) */}
              <div className="px-8 py-4 bg-gray-50 dark:bg-dark-hover border-t border-gray-200 dark:border-dark-border">
                <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                  Se o problema persistir, entre em contato com o{' '}
                  <span className="font-semibold text-primary-600 dark:text-primary-400">
                    suporte técnico
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Informação adicional */}
            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              <p>Código de Erro: {this.state.error?.name || 'UNKNOWN'}</p>
              <p className="mt-1">
                Timestamp: {new Date().toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
