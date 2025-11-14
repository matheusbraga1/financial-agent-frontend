import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/common';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

function App() {
  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <Router>
        <AuthProvider>
          {/* Toast notifications - Sonner (Modern toast library) */}
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              className: 'font-sans',
              style: {
                borderRadius: '12px',
                padding: '16px',
              },
            }}
          />

          {/* Rotas da aplicação */}
          <Routes>
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

            {/* Chat público - funciona com ou sem autenticação */}
            {/* Conversas são persistidas apenas para usuários autenticados */}
            <Route path="/chat" element={<Chat />} />

            {/* Rota 404 - Redireciona para chat */}
            <Route path="*" element={<Navigate to="/chat" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
