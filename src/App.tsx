import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { useStore } from './store/useStore';
import { OllamaService } from './services/ollamaService';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settings, updateSettings, setConnectionStatus, setModels, conversations, createConversation } = useStore();

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
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--claude-bg)' }}>
      {/* Sidebar */}
      <Sidebar 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
        theme={settings.theme}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ChatInterface />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;