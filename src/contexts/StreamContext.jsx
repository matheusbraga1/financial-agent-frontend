import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { streamManager } from '../features/chat/services/streamManager';

/**
 * StreamContext - Contexto React para gerenciamento global de streams
 *
 * Fornece acesso ao StreamManager e reatividade para componentes React.
 * Permite que múltiplos componentes observem e interajam com streams ativos.
 */
const StreamContext = createContext(null);

/**
 * Hook para acessar o contexto de streams
 * @returns {Object} Stream context value
 */
export const useStreamContext = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStreamContext deve ser usado dentro de StreamProvider');
  }
  return context;
};

/**
 * Hook para obter estado de stream de uma sessão específica
 * @param {string|null} sessionId
 * @returns {Object} Stream state for the session
 */
export const useSessionStream = (sessionId) => {
  const [state, setState] = useState(() =>
    sessionId ? streamManager.getStreamState(sessionId) : null
  );

  useEffect(() => {
    if (!sessionId) {
      setState(null);
      return;
    }

    // Obtém estado inicial
    setState(streamManager.getStreamState(sessionId));

    // Subscreve para atualizações
    const unsubscribe = streamManager.subscribe((updatedSessionId, newState) => {
      if (updatedSessionId === sessionId) {
        setState(newState);
      }
    });

    return unsubscribe;
  }, [sessionId]);

  return state;
};

/**
 * StreamProvider - Provider do contexto de streams
 */
export const StreamProvider = ({ children }) => {
  // Map de estados de streams ativos (para forçar re-renders)
  const [streamStates, setStreamStates] = useState(new Map());

  // Subscreve para mudanças globais
  useEffect(() => {
    const unsubscribe = streamManager.subscribe((sessionId, state) => {
      setStreamStates(prev => {
        const next = new Map(prev);
        if (state === null) {
          next.delete(sessionId);
        } else if (sessionId) {
          next.set(sessionId, state);
        }
        return next;
      });
    });

    return unsubscribe;
  }, []);

  /**
   * Inicia um stream
   */
  const startStream = useCallback(async (question, sessionId, messageId) => {
    return streamManager.startStream(question, sessionId, messageId);
  }, []);

  /**
   * Cancela um stream
   */
  const cancelStream = useCallback((sessionId) => {
    streamManager.cancelStream(sessionId);
  }, []);

  /**
   * Obtém estado de um stream
   */
  const getStreamState = useCallback((sessionId) => {
    return streamManager.getStreamState(sessionId);
  }, []);

  /**
   * Verifica se há stream ativo
   */
  const hasActiveStream = useCallback((sessionId) => {
    return streamManager.hasActiveStream(sessionId);
  }, []);

  /**
   * Limpa todos os streams
   */
  const clearAll = useCallback(() => {
    streamManager.clearAll();
  }, []);

  const value = useMemo(() => ({
    streamStates,
    startStream,
    cancelStream,
    getStreamState,
    hasActiveStream,
    clearAll,
  }), [streamStates, startStream, cancelStream, getStreamState, hasActiveStream, clearAll]);

  return (
    <StreamContext.Provider value={value}>
      {children}
    </StreamContext.Provider>
  );
};

StreamProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StreamContext;
