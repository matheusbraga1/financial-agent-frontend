import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, LogIn, UserPlus } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import MobileHeader from '../components/layout/MobileHeader/MobileHeader';
import ChatInterface from '../features/chat/ChatInterface';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de chat
 * Contém o layout completo com sidebar e interface de chat
 * Funciona com ou sem autenticação (conversas não autenticadas não são persistidas)
 */
const Chat = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar para desktop e mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header mobile */}
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Banner informativo para usuários não autenticados */}
        {!isAuthenticated && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Você está usando o chat sem login. Suas conversas{' '}
                    <span className="font-semibold">não serão salvas</span>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 rounded-md transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Fazer Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Criar Conta
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interface de chat */}
        <ChatInterface />
      </div>
    </div>
  );
};

export default Chat;
