import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu,
  Brain,
  Database,
  Zap,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  Settings
} from 'lucide-react';
import { chatService } from '../../../features/chat/services/chatService';
import { Card } from '../../common/Card';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import './ModelConfig.css';

/**
 * Componente para exibir configuração de modelos do backend
 * Mostra informações sobre LLM, Embeddings e RAG
 *
 * Backend retorna:
 * {
 *   llm: { provider, model, temperature },
 *   embeddings: { model, dimension },
 *   rag: { top_k, min_similarity, reranking_enabled }
 * }
 */
const ModelConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Carrega configuração dos modelos
   */
  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await chatService.getModels();
      setConfig(data);
    } catch (err) {
      console.error('Erro ao carregar configuração:', err);
      setError(err.message || 'Erro ao carregar configuração de modelos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  /**
   * Renderiza indicador de status
   */
  const StatusBadge = ({ active }) => (
    <div className={`
      flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
      ${active
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      }
    `}>
      {active ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Ativo
        </>
      ) : (
        <>
          <XCircle className="w-3.5 h-3.5" />
          Inativo
        </>
      )}
    </div>
  );

  /**
   * Renderiza loading state
   */
  if (loading) {
    return (
      <Card title="Configuração de Modelos" className="min-h-[400px]">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="large" text="Carregando configuração..." />
        </div>
      </Card>
    );
  }

  /**
   * Renderiza error state
   */
  if (error) {
    return (
      <Card title="Configuração de Modelos" variant="default">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <XCircle className="w-8 h-8" />
            <span className="text-lg font-medium">Erro ao carregar</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">
            {error}
          </p>
          <motion.button
            onClick={loadConfig}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              flex items-center gap-2 px-4 py-2
              bg-primary-600 hover:bg-primary-700
              text-white rounded-lg font-medium
              transition-colors duration-200
            "
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </motion.button>
        </div>
      </Card>
    );
  }

  /**
   * Renderiza empty state
   */
  if (!config) {
    return (
      <Card title="Configuração de Modelos">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-400">
            Nenhuma configuração disponível
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            Configuração de Modelos
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Informações sobre os modelos de IA em uso
          </p>
        </div>
        <motion.button
          onClick={loadConfig}
          whileHover={{ scale: 1.05, rotate: 180 }}
          whileTap={{ scale: 0.95 }}
          className="
            p-2 rounded-lg
            bg-gray-100 hover:bg-gray-200
            dark:bg-gray-800 dark:hover:bg-gray-700
            transition-colors duration-200
          "
          aria-label="Recarregar configuração"
        >
          <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>
      </motion.div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LLM Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            variant="gradient"
            hover
            className="h-full model-config-card"
          >
            <div className="flex items-start gap-4">
              <div className="
                p-3 rounded-xl
                bg-gradient-to-br from-blue-500 to-blue-600
                shadow-lg shadow-blue-500/30
              ">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Large Language Model
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Modelo de linguagem principal
                </p>

                <div className="space-y-3">
                  <InfoRow
                    label="Provider"
                    value={config.llm.provider.toUpperCase()}
                    icon={<Cpu className="w-4 h-4" />}
                  />
                  <InfoRow
                    label="Modelo"
                    value={config.llm.model}
                    highlight
                  />
                  <InfoRow
                    label="Temperature"
                    value={config.llm.temperature.toFixed(2)}
                    icon={<Zap className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Embeddings Configuration */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            variant="gradient"
            hover
            className="h-full model-config-card"
          >
            <div className="flex items-start gap-4">
              <div className="
                p-3 rounded-xl
                bg-gradient-to-br from-purple-500 to-purple-600
                shadow-lg shadow-purple-500/30
              ">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Embeddings
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Modelo de vetorização de texto
                </p>

                <div className="space-y-3">
                  <InfoRow
                    label="Modelo"
                    value={config.embeddings.model}
                    highlight
                  />
                  <InfoRow
                    label="Dimensão"
                    value={`${config.embeddings.dimension}D`}
                    icon={<TrendingUp className="w-4 h-4" />}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* RAG Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card
            variant="gradient"
            hover
            className="model-config-card"
          >
            <div className="flex items-start gap-4">
              <div className="
                p-3 rounded-xl
                bg-gradient-to-br from-green-500 to-green-600
                shadow-lg shadow-green-500/30
              ">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  RAG (Retrieval-Augmented Generation)
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                  Configuração de busca e geração aumentada
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <InfoRow
                      label="Top K"
                      value={config.rag.top_k}
                      tooltip="Número de documentos recuperados"
                    />
                  </div>
                  <div className="space-y-3">
                    <InfoRow
                      label="Similaridade Mínima"
                      value={`${(config.rag.min_similarity * 100).toFixed(0)}%`}
                      tooltip="Threshold de relevância"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Reranking
                      </span>
                      <StatusBadge active={config.rag.reranking_enabled} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="
          p-4 rounded-lg
          bg-blue-50 dark:bg-blue-900/20
          border border-blue-200 dark:border-blue-800
        "
      >
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Nota:</strong> Essas configurações são definidas no backend e não podem ser alteradas através desta interface.
          Para modificá-las, edite o arquivo de configuração do servidor.
        </p>
      </motion.div>
    </div>
  );
};

/**
 * Componente auxiliar para exibir linha de informação
 */
const InfoRow = ({ label, value, icon, highlight = false, tooltip }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-2">
      {icon && (
        <span className="text-gray-400 dark:text-gray-500">
          {icon}
        </span>
      )}
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {label}
      </span>
      {tooltip && (
        <span className="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
          ({tooltip})
        </span>
      )}
    </div>
    <span className={`
      text-sm font-medium
      ${highlight
        ? 'text-primary-600 dark:text-primary-400 font-semibold'
        : 'text-gray-900 dark:text-white'
      }
    `}>
      {value}
    </span>
  </div>
);

export default ModelConfig;
