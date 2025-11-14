import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, LogOut, User, Sparkles, Activity } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import MobileHeader from '../components/layout/MobileHeader/MobileHeader';

/**
 * Página Dashboard - Layout Atualizado
 * - Sidebar integrado com navegação
 * - Design moderno e cards informativos
 * - Responsivo e acessível
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
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-bg dark:via-dark-card dark:to-dark-bg">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header mobile apenas */}
        <MobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* Conteúdo do Dashboard */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Cabeçalho com saudação */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    Bem-vindo, {user?.name || user?.email}!
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-0.5">
                    Pronto para conversar com o Agente da Financial?
                  </p>
                </div>
              </div>
            </div>

            {/* Cards de ações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {/* Card: Nova Conversa */}
              <button
                onClick={handleStartChat}
                className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-[1.02] transition-all text-left group border border-gray-100 dark:border-dark-border"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 border border-gray-100 dark:border-dark-border">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 rounded-lg flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Seu Perfil
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <span className="text-gray-900 dark:text-gray-200 font-medium truncate">
                      {user?.email}
                    </span>
                  </div>
                  {user?.name && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400">Nome:</span>
                      <span className="text-gray-900 dark:text-gray-200 font-medium">
                        {user.name}
                      </span>
                    </div>
                  )}
                  {user?.is_admin && (
                    <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-700 dark:text-primary-400 font-medium w-fit">
                      <Sparkles className="w-4 h-4" />
                      Administrador
                    </div>
                  )}
                </div>
              </div>

              {/* Card: Status */}
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 border border-gray-100 dark:border-dark-border">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/20 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Status
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sistema</span>
                    <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Operacional
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">IA</span>
                    <span className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações adicionais */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-6 border border-primary-200 dark:border-primary-800">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white dark:bg-dark-card rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
                    Sobre o Agente da Financial
                  </h3>
                  <p className="text-primary-800 dark:text-primary-200 text-sm leading-relaxed">
                    Nosso assistente de IA está pronto para ajudá-lo com informações sobre processos,
                    documentos e procedimentos da Financial Imobiliária. Faça perguntas e obtenha
                    respostas baseadas em nossa base de conhecimento atualizada.
                  </p>
                </div>
              </div>
            </div>

            {/* Ação rápida de logout (opcional) */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;