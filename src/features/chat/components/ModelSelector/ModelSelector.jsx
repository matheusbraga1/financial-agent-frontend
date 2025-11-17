import { useState, useEffect } from 'react';
import { Bot, ChevronDown, Check } from 'lucide-react';
import { chatService } from '../../services/chatService';
import toast from 'react-hot-toast';

/**
 * Componente de seleção de modelo LLM
 * Permite ao usuário escolher qual modelo usar para as respostas
 *
 * @component
 * @example
 * <ModelSelector onModelChange={(modelInfo) => console.log(modelInfo)} />
 */
export const ModelSelector = ({ onModelChange, className = '' }) => {
  const [models, setModels] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await chatService.getModels();
      setModels(data);

      // Define modelo padrão
      if (data?.llm?.model) {
        const defaultModel = {
          name: data.llm.model,
          provider: data.llm.provider,
          temperature: data.llm.temperature,
        };
        setSelectedModel(defaultModel);
        onModelChange?.(defaultModel);
      }
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      toast.error('Não foi possível carregar os modelos disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (modelName) => {
    if (!models) return;

    const modelInfo = {
      name: modelName,
      provider: models.llm.provider,
      temperature: models.llm.temperature,
    };

    setSelectedModel(modelInfo);
    setIsOpen(false);
    onModelChange?.(modelInfo);
    toast.success(`Modelo alterado para ${modelName}`);
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
        <Bot className="w-4 h-4 animate-pulse" />
        <span>Carregando modelos...</span>
      </div>
    );
  }

  if (!models || !selectedModel) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                   bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750
                   transition-colors duration-200 text-sm font-medium"
        aria-label="Selecionar modelo"
        aria-expanded={isOpen}
      >
        <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-gray-700 dark:text-gray-300">{selectedModel.name}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-64 z-20 rounded-lg border border-gray-200 dark:border-gray-700
                         bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Modelo LLM
              </h3>
            </div>

            <div className="max-h-60 overflow-y-auto">
              <button
                onClick={() => handleModelSelect(models.llm.model)}
                className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-750
                           transition-colors duration-150 ${
                  selectedModel.name === models.llm.model
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {models.llm.model}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {models.llm.provider} • Temp: {models.llm.temperature}
                  </span>
                </div>
                {selectedModel.name === models.llm.model && (
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            </div>

            {/* Informações adicionais */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Embeddings:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {models.embeddings?.model || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Dimensões:</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {models.embeddings?.dimensions || 'N/A'}
                  </span>
                </div>
                {models.rag?.reranking_enabled && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 mt-1">
                    <Check className="w-3 h-3" />
                    <span>Reranking ativo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;
