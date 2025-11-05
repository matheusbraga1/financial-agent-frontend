import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => (
  <div
    className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg animate-fade-in"
    role="alert"
    aria-live="assertive"
  >
    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-medium text-red-900 dark:text-red-200">
        Erro ao processar mensagem
      </p>
      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
        {message}
      </p>
    </div>
  </div>
);

export default ErrorMessage;