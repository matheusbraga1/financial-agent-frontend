import { MessageSquare, Info } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Chat IA GLPI
                </h1>
                <p className="text-sm text-gray-600">
                  Assistente de Base de Conhecimento
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Informações"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Modal de informações */}
      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Sobre o Chat IA
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                Este assistente utiliza inteligência artificial para responder 
                perguntas baseadas na base de conhecimento do GLPI.
              </p>
              
              <div>
                <h3 className="font-semibold mb-2">Como usar:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Digite sua pergunta no campo abaixo</li>
                  <li>Aguarde a resposta do assistente</li>
                  <li>Consulte as fontes para mais detalhes</li>
                  <li>Use perguntas específicas para melhores resultados</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Tecnologia:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>LLM: Llama 3.1 8B</li>
                  <li>Vector DB: Qdrant</li>
                  <li>RAG: Busca semântica + híbrida</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Versão 1.0.0 - MVP
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;