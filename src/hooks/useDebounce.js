import { useState, useEffect } from 'react';

/**
 * Hook useDebounce
 * Debounce para otimizar performance de inputs e pesquisas
 *
 * @param {any} value - Valor a ser debounced
 * @param {number} delay - Delay em ms (padrão: 500ms)
 * @returns {any} Valor debounced
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // Só executa após 500ms sem mudanças
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Criar timer
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancela o timer se value mudar antes do delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
