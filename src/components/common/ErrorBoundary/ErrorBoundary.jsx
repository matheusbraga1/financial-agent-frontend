import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg px-4">
          <div className="max-w-md w-full bg-white dark:bg-dark-card rounded-lg shadow-xl border border-gray-100 dark:border-dark-border p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-4 ring-4 ring-red-50 dark:ring-red-900/20">
              <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ops! Algo deu errado
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>

            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Recarregar Página
            </button>

            {this.props.showDetails && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Detalhes do erro
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 dark:bg-dark-bg p-3 rounded overflow-auto text-gray-800 dark:text-gray-200">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;