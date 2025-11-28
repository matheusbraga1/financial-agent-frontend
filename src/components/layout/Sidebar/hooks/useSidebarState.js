import { useReducer, useMemo } from 'react';

/**
 * Estado inicial da sidebar
 */
const getInitialState = () => ({
  isCollapsed: localStorage.getItem('sidebar:collapsed') === '1',
  showInfo: false,
  showUserMenu: false,
  showSearchModal: false,
  isLoggingOut: false,
});

/**
 * Reducer para gerenciar estado da sidebar
 */
const sidebarReducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE_COLLAPSE': {
      const newCollapsed = !state.isCollapsed;
      localStorage.setItem('sidebar:collapsed', newCollapsed ? '1' : '0');
      return {
        ...state,
        isCollapsed: newCollapsed,
        showUserMenu: false, // Fecha menu ao colapsar
      };
    }

    case 'OPEN_INFO':
      return {
        ...state,
        showInfo: true,
        showUserMenu: false,
        showSearchModal: false,
      };

    case 'CLOSE_INFO':
      return { ...state, showInfo: false };

    case 'TOGGLE_USER_MENU':
      return {
        ...state,
        showUserMenu: !state.showUserMenu,
        showSearchModal: false,
      };

    case 'CLOSE_USER_MENU':
      return { ...state, showUserMenu: false };

    case 'OPEN_SEARCH':
      return {
        ...state,
        showSearchModal: true,
        showUserMenu: false,
      };

    case 'CLOSE_SEARCH':
      return { ...state, showSearchModal: false };

    case 'START_LOGOUT':
      return { ...state, isLoggingOut: true };

    case 'END_LOGOUT':
      return { ...state, isLoggingOut: false };

    case 'CLOSE_ALL':
      return {
        ...state,
        showInfo: false,
        showUserMenu: false,
        showSearchModal: false,
      };

    default:
      return state;
  }
};

/**
 * Hook customizado para gerenciar estado da sidebar
 * Consolida todos os estados e ações em um único hook
 */
export const useSidebarState = () => {
  const [state, dispatch] = useReducer(sidebarReducer, null, getInitialState);

  const actions = useMemo(
    () => ({
      toggleCollapse: () => dispatch({ type: 'TOGGLE_COLLAPSE' }),
      openInfo: () => dispatch({ type: 'OPEN_INFO' }),
      closeInfo: () => dispatch({ type: 'CLOSE_INFO' }),
      toggleUserMenu: () => dispatch({ type: 'TOGGLE_USER_MENU' }),
      closeUserMenu: () => dispatch({ type: 'CLOSE_USER_MENU' }),
      openSearch: () => dispatch({ type: 'OPEN_SEARCH' }),
      closeSearch: () => dispatch({ type: 'CLOSE_SEARCH' }),
      startLogout: () => dispatch({ type: 'START_LOGOUT' }),
      endLogout: () => dispatch({ type: 'END_LOGOUT' }),
      closeAll: () => dispatch({ type: 'CLOSE_ALL' }),
    }),
    []
  );

  return [state, actions];
};
