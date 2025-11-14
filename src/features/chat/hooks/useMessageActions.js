import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook para ações de mensagens (copiar, compartilhar, etc)
 * - Gerencia estado de cópia
 * - Fornece feedback via toast
 * - Cleanup automático
 */
export const useMessageActions = (message) => {
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  /**
   * Cleanup de timeout ao desmontar
   */
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Copia conteúdo da mensagem
   */
  const handleCopy = useCallback(async () => {
    if (!message?.content) return;

    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);

      toast.success('Copiado!', {
        description: 'Mensagem copiada para área de transferência',
        duration: 2000,
      });

      // Limpar timeout anterior
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      // Reset estado após 2s
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
      toast.error('Erro ao copiar', {
        description: 'Não foi possível copiar a mensagem',
      });
    }
  }, [message?.content]);

  /**
   * Compartilha mensagem (Web Share API)
   */
  const handleShare = useCallback(async () => {
    if (!message?.content) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Resposta do Agente Financial',
          text: message.content,
        });

        toast.success('Compartilhado!', {
          description: 'Mensagem compartilhada com sucesso',
        });
      } catch (err) {
        // User cancelled - não mostrar erro
        if (err.name !== 'AbortError') {
          console.error('Erro ao compartilhar:', err);
        }
      }
    } else {
      // Fallback: copiar para clipboard
      handleCopy();
      toast.info('Copiado para área de transferência', {
        description: 'Compartilhamento não disponível neste navegador',
      });
    }
  }, [message?.content, handleCopy]);

  return {
    copied,
    handleCopy,
    handleShare,
  };
};
