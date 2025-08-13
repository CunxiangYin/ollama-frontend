import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';
import { OllamaService } from '../services/ollamaService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, setModels, setConnectionStatus, currentConversationId, conversations, updateModelConfig } = useStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const [modelConfig, setModelConfig] = useState(currentConversation?.modelConfig || {
    model: 'llama2',
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    repeatPenalty: 1.1,
    maxTokens: 2048,
    systemPrompt: '',
  });

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (currentConversation) {
      setModelConfig(currentConversation.modelConfig);
    }
  }, [currentConversation]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    const service = new OllamaService(localSettings.ollama.baseUrl, localSettings.ollama.port);
    const isConnected = await service.testConnection();
    
    if (isConnected) {
      const models = await service.getModels();
      setModels(models.map(m => m.name));
      setTestResult('Connection successful!');
      setConnectionStatus(true);
    } else {
      setTestResult('Connection failed. Please check your settings.');
      setConnectionStatus(false);
    }
    
    setTesting(false);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    if (currentConversationId) {
      updateModelConfig(currentConversationId, modelConfig);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <Dialog.Title className="text-xl font-semibold dark:text-white">Settings</Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Connection Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4 dark:text-white">Ollama Connection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Base URL</label>
                  <input
                    type="text"
                    value={localSettings.ollama.baseUrl}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      ollama: { ...localSettings.ollama, baseUrl: e.target.value }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="http://localhost"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Port</label>
                  <input
                    type="number"
                    value={localSettings.ollama.port}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      ollama: { ...localSettings.ollama, port: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="11434"
                  />
                </div>
                <button
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
                {testResult && (
                  <div className={`text-sm ${testResult.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
                    {testResult}
                  </div>
                )}
              </div>
            </div>

            {/* Model Configuration */}
            {currentConversationId && (
              <div>
                <h3 className="text-lg font-medium mb-4 dark:text-white">Model Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Model</label>
                    <select
                      value={modelConfig.model}
                      onChange={(e) => setModelConfig({ ...modelConfig, model: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="qwen3:32b">Qwen3 32B</option>
                      <option value="llama2">Llama 2</option>
                      <option value="mistral">Mistral</option>
                      <option value="codellama">Code Llama</option>
                      <option value="mixtral">Mixtral</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                      Temperature: {modelConfig.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={modelConfig.temperature}
                      onChange={(e) => setModelConfig({ ...modelConfig, temperature: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                      Top P: {modelConfig.topP}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={modelConfig.topP}
                      onChange={(e) => setModelConfig({ ...modelConfig, topP: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                      Top K: {modelConfig.topK}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={modelConfig.topK}
                      onChange={(e) => setModelConfig({ ...modelConfig, topK: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">
                      Repeat Penalty: {modelConfig.repeatPenalty}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={modelConfig.repeatPenalty}
                      onChange={(e) => setModelConfig({ ...modelConfig, repeatPenalty: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">Max Tokens</label>
                    <input
                      type="number"
                      min="100"
                      max="8192"
                      value={modelConfig.maxTokens}
                      onChange={(e) => setModelConfig({ ...modelConfig, maxTokens: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 dark:text-gray-300">System Prompt</label>
                    <textarea
                      value={modelConfig.systemPrompt}
                      onChange={(e) => setModelConfig({ ...modelConfig, systemPrompt: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                      placeholder="Enter system prompt (optional)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UI Settings */}
            <div>
              <h3 className="text-lg font-medium mb-4 dark:text-white">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Theme</label>
                  <select
                    value={localSettings.theme}
                    onChange={(e) => setLocalSettings({ ...localSettings, theme: e.target.value as 'light' | 'dark' })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};