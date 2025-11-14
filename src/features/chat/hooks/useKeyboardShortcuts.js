import { useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Hook para gerenciar atalhos de teclado globais do chat
 *
 * Atalhos disponíveis:
 * - Cmd/Ctrl + K: Focar no input
 * - Escape: Cancelar streaming (se ativo)
 * - Cmd/Ctrl + Shift + C: Copiar última resposta
 * - Cmd/Ctrl + /:  Mostrar ajuda de atalhos
 */
export const useKeyboardShortcuts = ({
  textareaRef,
  isStreaming,
  stopGeneration,
  messages,
  scrollToBottom,
}) => {
  useEffect(() => {
    const handleKeyboard = (e) => {
      const isMod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      // Cmd/Ctrl + K - Foco no input
      if (isMod && key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
        toast.info('Input focado', {
          description: 'Use Cmd+K para focar rapidamente',
          duration: 1500,
        });
      }

      // Esc - Cancelar streaming
      if (key === 'escape' && isStreaming) {
        e.preventDefault();
        stopGeneration?.();
        toast.success('Geração cancelada', {
          description: 'A resposta foi interrompida',
        });
      }

      // Cmd/Ctrl + Shift + C - Copiar última resposta
      if (isMod && e.shiftKey && key === 'c') {
        e.preventDefault();
        const lastAssistantMessage = [...messages]
          .reverse()
          .find(msg => msg.type === 'assistant');

        if (lastAssistantMessage?.content) {
          navigator.clipboard.writeText(lastAssistantMessage.content);
          toast.success('Última resposta copiada!', {
            description: 'Use Cmd+Shift+C para copiar rapidamente',
          });
        }
      }

      // Cmd/Ctrl + Down Arrow - Scroll para o bottom
      if (isMod && key === 'arrowdown') {
        e.preventDefault();
        scrollToBottom?.();
      }

      // Cmd/Ctrl + / - Mostrar ajuda de atalhos
      if (isMod && key === '/') {
        e.preventDefault();
        toast.info('Atalhos de Teclado', {
          description: (
            <div className="space-y-1 text-xs">
              <p>• Cmd+K: Focar input</p>
              <p>• Esc: Cancelar geração</p>
              <p>• Cmd+Shift+C: Copiar última resposta</p>
              <p>• Cmd+↓: Scroll para o final</p>
            </div>
          ),
          duration: 5000,
        });
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isStreaming, messages, stopGeneration, scrollToBottom, textareaRef]);
};
