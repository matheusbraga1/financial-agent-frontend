import { useEffect, useRef, useState } from 'react';

/**
 * Hook useIntersectionObserver
 * Detecta quando um elemento entra no viewport
 * Útil para lazy loading e animações on scroll
 *
 * @param {Object} options - Opções do IntersectionObserver
 * @returns {[React.Ref, boolean]} - [ref, isIntersecting]
 *
 * @example
 * const [ref, isVisible] = useIntersectionObserver({ threshold: 0.5 });
 *
 * return (
 *   <div ref={ref} className={isVisible ? 'fade-in' : 'opacity-0'}>
 *     Conteúdo lazy loaded
 *   </div>
 * );
 */
export const useIntersectionObserver = (options = {}) => {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '0px',
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]);

  return [ref, isIntersecting];
};

export default useIntersectionObserver;
