import { useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/layout/Sidebar';
import MobileHeader from './components/layout/MobileHeader';
import ChatInterface from './features/chat/ChatInterface';
import { ErrorBoundary } from './components/common';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const clearMessagesRef = useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNewConversation = () => {
    if (clearMessagesRef.current) {
      clearMessagesRef.current();
    }
  };

  return (
    <ErrorBoundary showDetails={import.meta.env.DEV}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#1f2937',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          success: {
            iconTheme: {
              primary: '#00884f',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="h-screen flex overflow-hidden bg-neutral-50 dark:bg-dark-bg">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isSidebarOpen}
          onToggleMobile={toggleSidebar}
          onNewConversation={handleNewConversation}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Mobile */}
          <MobileHeader onToggleSidebar={toggleSidebar} />

          {/* Chat Interface */}
          <ChatInterface
            onClearMessages={(clearFn) => {
              clearMessagesRef.current = clearFn;
            }}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App
