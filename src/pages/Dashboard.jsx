import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, LogOut, User, Sparkles, Activity } from 'lucide-react';
import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar/Sidebar';
import MobileHeader from '../components/layout/MobileHeader/MobileHeader';
import { generateAvatarGradient, getAvatarInitial, getDisplayName } from '../utils';

/**
 * Página Dashboard - Mobile-First Responsivo
 * - Background simplificado (sem gradientes complexos)
 * - Cards otimizados para mobile
 * - Touch targets adequados (min 44px)
 * - Tipografia responsiva
 * - Espaçamentos consistentes
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
    navigate('/chat', { state: { newConversation: true } });
  };

  const handleNewConversation = () => {
    navigate('/chat', { state: { newConversation: true } });
    setIsSidebarOpen(false);
  };

  const handleSelectSession = (sessionId) => {
    navigate('/chat');
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-dark-bg">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentSessionId={null}
        onSelectSession={handleSelectSession}
        onNewConversation={handleNewConversation}
      />

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header mobile apenas */}
        <MobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* Conteúdo do Dashboard */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Cabeçalho com saudação - Mobile-first */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-base sm:text-lg font-bold shadow-lg flex-shrink-0"
                  style={{ background: generateAvatarGradient(user?.username || user?.email || 'U') }}
                >
                  {getAvatarInitial(user)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white truncate">
                    Bem-vindo, {getDisplayName(user)}!
                  </h1>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-0.5">
                    Pronto para conversar com o Agente da Financial?
                  </p>
                </div>
              </div>
            </div>

            {/* Cards de ações - Mobile-first grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {/* Card: Nova Conversa */}
              <button
                onClick={handleStartChat}
                className="bg-white dark:bg-dark-card rounded-xl shadow-md hover:shadow-lg p-4 sm:p-5 lg:p-6 hover:scale-[1.02] active:scale-[0.98] transition-all text-left group border border-gray-200 dark:border-dark-border min-h-[120px] sm:min-h-[140px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/40 dark:to-primary-800/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 sm:mb-2">
                  Nova Conversa
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Inicie uma nova conversa com o assistente de IA
                </p>
              </button>

              {/* Card: Perfil */}
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-dark-border min-h-[120px] sm:min-h-[140px]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Seu Perfil
                </h3>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  {user?.username && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Usuário:</span>
                      <span className="text-gray-900 dark:text-gray-200 font-medium truncate">
                        {user.username}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">Email:</span>
                    <span className="text-gray-900 dark:text-gray-200 font-medium truncate">
                      {user?.email}
                    </span>
                  </div>
                  {user?.is_admin && (
                    <div className="flex items-center gap-1.5 mt-2 sm:mt-3 px-2 sm:px-3 py-1 sm:py-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-700 dark:text-primary-400 font-medium w-fit text-xs">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>Administrador</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card: Status */}
              <div className="bg-white dark:bg-dark-card rounded-xl shadow-md p-4 sm:p-5 lg:p-6 border border-gray-200 dark:border-dark-border min-h-[120px] sm:min-h-[140px]">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/40 dark:to-green-800/20 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Status
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Sistema</span>
                    <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>
                      Operacional
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">IA</span>
                    <span className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>
                      Ativo
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações adicionais - Simplificado */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-4 sm:p-5 lg:p-6 border border-primary-200 dark:border-primary-800">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white dark:bg-dark-card rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-primary-900 dark:text-primary-100 mb-1.5 sm:mb-2">
                    Sobre o Agente da Financial
                  </h3>
                  <p className="text-primary-800 dark:text-primary-200 text-xs sm:text-sm leading-relaxed">
                    Nosso assistente de IA está pronto para ajudá-lo com informações sobre processos,
                    documentos e procedimentos da Financial Imobiliária. Faça perguntas e obtenha
                    respostas baseadas em nossa base de conhecimento atualizada.
                  </p>
                </div>
              </div>
            </div>

            {/* Ação rápida de logout */}
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors group min-h-[44px]"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform" />
                <span>Sair da conta</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
