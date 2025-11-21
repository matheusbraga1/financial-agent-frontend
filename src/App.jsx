import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from './components/common';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';

/**
 * Extrai a rota base para usar como key no AnimatePresence
 * Isso evita remontar toda a aplicação ao mudar de conversa
 * 
 * /chat e /chat/:sessionId → 'chat'
 * /login → 'login'
 * /dashboard → 'dashboard'
 */
const getRouteKey = (pathname) => {
  // Remove leading slash e pega primeiro segmento
  const segments = pathname.split('/').filter(Boolean);
  return segments[0] || 'home';
};

/**
 * Componente interno para rotas animadas
 */
function AnimatedRoutes() {
  const location = useLocation();
  
  // Usa rota base como key, não pathname completo
  // Assim /chat e /chat/abc123 têm a mesma key ('chat')
  // e não causam remontagem do componente Chat
  const routeKey = getRouteKey(location.pathname);

  return (
    <>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        duration={4000}
        toastOptions={{
          className: 'font-sans',
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1)',
          },
          classNames: {
            success: 'toast-success',
            error: 'toast-error',
            warning: 'toast-warning',
            info: 'toast-info',
          },
        }}
      />

      {/* Rotas com animação apenas entre páginas diferentes */}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={routeKey}>
          {/* Rota raiz */}
          <Route path="/" element={<Navigate to="/chat" replace />} />

          {/* Rotas públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />

          {/* 
            Chat Routes - Mesma key para ambas as rotas
            /chat           → Nova conversa
            /chat/:sessionId → Conversa específica
            
            O Chat.jsx internamente usa key no ChatInterface
            para remontar apenas a interface quando sessionId muda
          */}
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:sessionId" element={<Chat />} />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <Router>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;