import { useEffect } from 'react';

/**
 * Hook para gerenciar atalhos de teclado da sidebar
 *
 * Atalhos:
 * - Cmd/Ctrl + K: Abrir busca
 * - Cmd/Ctrl + N: Nova conversa
 * - Escape: Fechar modais
 */
export const useSidebarKeyboard = ({
  onNewConversation,
  onOpenSearch,
  onCloseSearch,
  onCloseUserMenu,
  onCloseInfo,
  showSearchModal,
  showUserMenu,
  showInfo,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = (e.key || '').toLowerCase();

      // Cmd/Ctrl + K: Abrir busca
      if (mod && key === 'k') {
        e.preventDefault();
        onOpenSearch?.();
        return;
      }

      // Cmd/Ctrl + N: Nova conversa
      if (mod && key === 'n') {
        e.preventDefault();
        onNewConversation?.();
        return;
      }

      // Escape: Fechar modais (prioridade: search > userMenu > info)
      if (key === 'escape') {
        if (showSearchModal) {
          onCloseSearch?.();
        } else if (showUserMenu) {
          onCloseUserMenu?.();
        } else if (showInfo) {
          onCloseInfo?.();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onNewConversation,
    onOpenSearch,
    onCloseSearch,
    onCloseUserMenu,
    onCloseInfo,
    showSearchModal,
    showUserMenu,
    showInfo,
  ]);
};
