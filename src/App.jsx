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

// Component interno para usar useLocation dentro do Router
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      {/* Toast notifications premium com glassmorphism */}
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

      {/* Rotas animadas com AnimatePresence */}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Rota raiz - redireciona para chat (público) */}
          <Route path="/" element={<Navigate to="/chat" replace />} />

          {/* Rotas públicas (redireciona para dashboard se já autenticado) */}
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

          {/* Rotas protegidas (requerem autenticação) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Rota de documentos (admin apenas) */}
          <Route
            path="/documents"
            element={
              <ProtectedRoute>
                <Documents />
              </ProtectedRoute>
            }
          />

          {/* Chat público - funciona com ou sem autenticação */}
          {/* Conversas são persistidas apenas para usuários autenticados */}
          <Route path="/chat" element={<Chat />} />

          {/* Rota de configurações (requer autenticação) */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Rota de painel admin (requer autenticação e admin) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* Rota 404 - Redireciona para chat */}
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
