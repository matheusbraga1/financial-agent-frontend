import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Palette } from 'lucide-react';
import { ModelConfig } from '../components/admin';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * Página de Configurações
 * Exibe diferentes seções de configuração, incluindo modelos de IA
 */
const Settings = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Redireciona se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerencie as configurações da sua conta e do sistema
          </p>
        </motion.div>

        {/* Tabs de navegação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <TabButton icon={<Palette />} label="Geral" active />
              <TabButton icon={<Bell />} label="Notificações" />
              <TabButton icon={<Shield />} label="Segurança" />
              {isAdmin && (
                <TabButton icon={<SettingsIcon />} label="Sistema" />
              )}
            </nav>
          </div>
        </motion.div>

        {/* Conteúdo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Configuração de Modelos (visível para todos) */}
          <ModelConfig />
        </motion.div>
      </div>
    </div>
  );
};

/**
 * Componente de botão de tab
 */
const TabButton = ({ icon, label, active = false }) => (
  <button
    className={`
      flex items-center gap-2 px-4 py-3
      border-b-2 font-medium text-sm
      transition-all duration-200
      ${active
        ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
      }
    `}
  >
    {icon}
    {label}
  </button>
);

export default Settings;
