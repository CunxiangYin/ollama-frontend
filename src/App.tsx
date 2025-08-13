import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { useStore } from './store/useStore';
import { OllamaService } from './services/ollamaService';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { settings, updateSettings, setConnectionStatus, setModels, conversations, createConversation } = useStore();

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply theme
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Test connection on mount and when settings change
  useEffect(() => {
    const testConnection = async () => {
      const service = new OllamaService(settings.ollama.baseUrl, settings.ollama.port);
      const isConnected = await service.testConnection();
      setConnectionStatus(isConnected);
      
      if (isConnected) {
        const models = await service.getModels();
        setModels(models.map(m => m.name));
      }
    };

    testConnection();
  }, [settings.ollama, setConnectionStatus, setModels]);

  // Create initial conversation if none exists
  useEffect(() => {
    if (conversations.length === 0) {
      createConversation();
    }
  }, [conversations.length, createConversation]);

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'var(--claude-bg)' }}>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg md:hidden"
          style={{ 
            background: 'var(--claude-bg-secondary)',
            border: '1px solid var(--claude-border)'
          }}
        >
          {isMobileSidebarOpen ? (
            <XMarkIcon className="w-6 h-6" style={{ color: 'var(--claude-text-primary)' }} />
          ) : (
            <Bars3Icon className="w-6 h-6" style={{ color: 'var(--claude-text-primary)' }} />
          )}
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'}
        ${isMobile && !isMobileSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        transition-transform duration-300 ease-in-out
        z-40 h-full
        md:translate-x-0 md:relative
      `}>
        <Sidebar 
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            setIsMobileSidebarOpen(false);
          }}
          onToggleTheme={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
          theme={settings.theme}
          onSelectConversation={() => {
            if (isMobile) {
              setIsMobileSidebarOpen(false);
            }
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatInterface isMobile={isMobile} />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isMobile={isMobile}
      />
    </div>
  );
}

export default App;