import { useState } from 'react';
import { MessageSquare, Info } from 'lucide-react';
import InfoModal from './InfoModal';

const Header = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">
                  Agente da Financial
                </h1>
                <p className="text-sm text-gray-600">
                  Assistente de Base de Conhecimento
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Informações" 
              aria-label="Abrir informações"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </>
  );
};

export default Header;