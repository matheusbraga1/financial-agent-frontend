import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, LogOut, User } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import MobileHeader from '../components/layout/MobileHeader/MobileHeader';
import { useState } from 'react';

/**
 * Página de Dashboard (Home)
 * Página inicial após o login
 */
const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleStartChat = () => {
    navigate('/chat');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar para desktop e mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header mobile */}
        <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Conteúdo do Dashboard */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Cabeçalho */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Bem-vindo, {user?.name || user?.email}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Pronto para conversar com o Agente da Financial?
              </p>
            </div>

            {/* Cards de ações */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card: Nova Conversa */}
              <button
                onClick={handleStartChat}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow text-left group"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                  <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Nova Conversa
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Inicie uma nova conversa com o assistente de IA
                </p>
              </button>

              {/* Card: Perfil */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Seu Perfil
                </h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  {user?.name && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Nome:</span> {user.name}
                    </p>
                  )}
                  {user?.is_admin && (
                    <p className="text-primary-600 dark:text-primary-400 font-medium">
                      Administrador
                    </p>
                  )}
                </div>
              </div>

              {/* Card: Logout */}
              <button
                onClick={handleLogout}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow text-left group"
              >
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                  <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Sair
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Encerrar sua sessão
                </p>
              </button>
            </div>

            {/* Informações adicionais */}
            <div className="mt-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                Sobre o Agente da Financial
              </h3>
              <p className="text-primary-800 dark:text-primary-200 text-sm leading-relaxed">
                Nosso assistente de IA está pronto para ajudá-lo com informações sobre processos,
                documentos e procedimentos da Financial Imobiliária. Faça perguntas e obtenha
                respostas baseadas em nossa base de conhecimento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
