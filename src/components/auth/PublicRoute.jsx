import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * Componente de rota pública
 * Redireciona para dashboard se o usuário já estiver autenticado
 * Usado para páginas como Login e Register
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Componente filho a ser renderizado
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();

  // Mostra loading enquanto verifica autenticação
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se já estiver autenticado, redireciona para dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se não estiver autenticado, renderiza o componente filho (Login/Register)
  return children;
};

export default PublicRoute;
