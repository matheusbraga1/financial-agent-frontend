import { useState, useMemo, useEffect, useCallback } from 'react';

/**
 * Debounce helper
 */
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Hook para busca funcional no histórico de conversas
 * - Debounce para performance
 * - Busca fuzzy (case-insensitive)
 * - Busca em múltiplos campos (mensagem, data)
 */
export const useSidebarSearch = (sessions = []) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce da query (300ms)
  const debouncedSetQuery = useMemo(
    () =>
      debounce((value) => {
        setDebouncedQuery(value);
        setIsSearching(false);
      }, 300),
    []
  );

  useEffect(() => {
    if (query.trim()) {
      setIsSearching(true);
      debouncedSetQuery(query);
    } else {
      setDebouncedQuery('');
      setIsSearching(false);
    }
  }, [query, debouncedSetQuery]);

  // Filtra sessões baseado na query
  const results = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return sessions;
    }

    const searchTerm = debouncedQuery.toLowerCase().trim();

    return sessions.filter((session) => {
      // Busca na última mensagem
      const messageMatch = session.last_message
        ?.toLowerCase()
        .includes(searchTerm);

      // Busca na data (formato pt-BR)
      const dateMatch = session.created_at
        ?.toLowerCase()
        .includes(searchTerm);

      return messageMatch || dateMatch;
    });
  }, [sessions, debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsSearching(false);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasQuery: !!debouncedQuery.trim(),
    clearSearch,
    resultsCount: results.length,
  };
};
