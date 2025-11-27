import { memo, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Search, MessageSquare, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConversationHistory from '../../ConversationHistory/ConversationHistory';
import { useSidebarSearch } from '../hooks';
import { chatService } from '../../../../features/chat/services';

/**
 * Modal de busca de conversas
 * - Busca funcional com debounce
 * - Loading states
 * - Empty states
 * - Highlight de resultados
 * - Navegação por teclado
 */
const SidebarSearch = memo(
  ({ isOpen, onClose, onSelectSession, currentSessionId, isAuthenticated }) => {
    const [sessions, setSessions] = useState([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    const inputRef = useRef(null);

    const { query, setQuery, results, isSearching, hasQuery, clearSearch, resultsCount } =
      useSidebarSearch(sessions);

    // Carrega sessões quando abre
    useEffect(() => {
      const loadSessions = async () => {
        if (isOpen && isAuthenticated) {
          setIsLoadingSessions(true);
          try {
            const data = await chatService.getUserSessions();
            setSessions(data);
          } catch (err) {
            console.error('Erro ao carregar sessões:', err);
          } finally {
            setIsLoadingSessions(false);
          }
        }
      };

      loadSessions();
    }, [isOpen, isAuthenticated]);

    // Auto-focus no input
    useEffect(() => {
      if (isOpen && inputRef.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }, [isOpen]);

    const handleSelectSession = (sessionId) => {
      onSelectSession(sessionId);
      onClose();
      clearSearch();
    };

    const handleClose = () => {
      onClose();
      clearSearch();
    };

    if (!isOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] flex items-start justify-center p-4 pt-16 sm:pt-20"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border max-w-2xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-gray-50/50 to-transparent dark:from-dark-bg/50">
              <Search className="w-5 h-5 text-primary-500 dark:text-primary-400 flex-shrink-0" />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar conversas..."
                className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />

              {/* Loading/Clear */}
              {isSearching ? (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin flex-shrink-0" />
              ) : query ? (
                <button
                  onClick={clearSearch}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-dark-hover rounded transition-colors"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              ) : null}

              <kbd className="hidden sm:flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-hover px-2 py-1 rounded-md border border-gray-200 dark:border-dark-border flex-shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto p-3 sidebar-scroll">
              {isLoadingSessions ? (
                // Loading state
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary-500 dark:text-primary-400 animate-spin mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Carregando conversas...
                  </p>
                </div>
              ) : !isAuthenticated ? (
                // Not authenticated
                <div className="p-8 sm:p-12 text-center text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 opacity-30" />
                  <p className="text-sm sm:text-base font-medium">
                    Faça login para ver seu histórico
                  </p>
                </div>
              ) : hasQuery && resultsCount === 0 ? (
                // No results
                <div className="p-8 sm:p-12 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 opacity-30" />
                  <p className="text-sm sm:text-base font-medium mb-2">
                    Nenhuma conversa encontrada
                  </p>
                  <p className="text-xs sm:text-sm opacity-75">
                    Tente buscar por outras palavras-chave
                  </p>
                </div>
              ) : (
                // Results
                <ConversationHistory
                  onSelectSession={handleSelectSession}
                  currentSessionId={currentSessionId}
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-5 py-3 bg-gray-50 dark:bg-dark-hover border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline">Atalho: ⌘K ou Ctrl+K</span>
                  <span className="sm:hidden">⌘K</span>
                  {hasQuery && (
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {resultsCount} {resultsCount === 1 ? 'resultado' : 'resultados'}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline">Navegue com ↑↓ Enter</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
);

SidebarSearch.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectSession: PropTypes.func.isRequired,
  currentSessionId: PropTypes.string,
  isAuthenticated: PropTypes.bool,
};

SidebarSearch.displayName = 'SidebarSearch';

export default SidebarSearch;
