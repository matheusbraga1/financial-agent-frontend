import { motion } from 'framer-motion';
import { Shield, Users, Database, Activity } from 'lucide-react';
import { ModelConfig } from '../components/admin';
import { Card } from '../components/common/Card';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * Página de Painel Administrativo
 * Acessível apenas para administradores
 */
const AdminPanel = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();

  // Redireciona se não estiver autenticado ou não for admin
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
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
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Painel Administrativo
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Bem-vindo, <strong>{user?.username}</strong>. Você tem acesso total ao sistema.
          </p>
        </motion.div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Usuários Ativos"
            value="247"
            change="+12%"
            color="blue"
          />
          <StatCard
            icon={<Database className="w-6 h-6" />}
            label="Documentos"
            value="1,834"
            change="+8%"
            color="green"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            label="Conversas"
            value="5,421"
            change="+23%"
            color="purple"
          />
        </div>

        {/* Configuração de Modelos */}
        <ModelConfig />
      </div>
    </div>
  );
};

/**
 * Componente de card de estatística
 */
const StatCard = ({ icon, label, value, change, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    green: 'from-green-500 to-green-600 shadow-green-500/30',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card variant="gradient" hover>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {label}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {change} vs. último mês
            </p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AdminPanel;
