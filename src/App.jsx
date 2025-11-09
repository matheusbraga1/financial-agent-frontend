import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
          {/* Toast notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '10px',
                padding: '14px 18px',
                fontSize: '14px',
                maxWidth: '500px',
              },
              // Success toast
              success: {
                iconTheme: {
                  primary: '#00884f',
                  secondary: '#fff',
                },
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #86efac',
                },
                className: 'dark:!bg-green-900/30 dark:!text-green-200 dark:!border-green-700',
              },
              // Error toast
              error: {
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#fff',
                },
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fca5a5',
                },
                className: 'dark:!bg-red-900/30 dark:!text-red-200 dark:!border-red-700',
                duration: 5000,
              },
              // Loading toast
              loading: {
                iconTheme: {
                  primary: '#00884f',
                  secondary: '#fff',
                },
                style: {
                  background: '#f9fafb',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                },
                className: 'dark:!bg-gray-800 dark:!text-gray-200 dark:!border-gray-700',
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
