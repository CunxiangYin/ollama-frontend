import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation, Message, ModelConfig, AppSettings } from '../types';

interface Store {
  conversations: Conversation[];
  currentConversationId: string | null;
  settings: AppSettings;
  models: string[];
  isConnected: boolean;
  
  // Actions
  createConversation: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateModelConfig: (conversationId: string, config: Partial<ModelConfig>) => void;
  setModels: (models: string[]) => void;
  setConnectionStatus: (status: boolean) => void;
  renameConversation: (id: string, title: string) => void;
}

const defaultSettings: AppSettings = {
  ollama: {
    baseUrl: 'http://192.168.1.86',
    port: 11434,
  },
  theme: 'light',
  fontSize: 14,
};

const defaultModelConfig: ModelConfig = {
  model: 'qwen3:32b',
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  repeatPenalty: 1.1,
  maxTokens: 2048,
  systemPrompt: '',
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      conversations: [],
      currentConversationId: null,
      settings: defaultSettings,
      models: [],
      isConnected: false,

      createConversation: () => {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [],
          modelConfig: defaultModelConfig,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: newConversation.id,
        }));
      },

      selectConversation: (id) => {
        set({ currentConversationId: id });
      },

      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter(c => c.id !== id),
          currentConversationId: state.currentConversationId === id ? null : state.currentConversationId,
        }));
      },

      addMessage: (conversationId, message) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      updateMessage: (conversationId, messageId, content) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map(m =>
                    m.id === messageId ? { ...m, content } : m
                  ),
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      updateModelConfig: (conversationId, config) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === conversationId
              ? {
                  ...c,
                  modelConfig: { ...c.modelConfig, ...config },
                  updatedAt: new Date(),
                }
              : c
          ),
        }));
      },

      setModels: (models) => {
        set({ models });
      },

      setConnectionStatus: (status) => {
        set({ isConnected: status });
      },

      renameConversation: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map(c =>
            c.id === id ? { ...c, title, updatedAt: new Date() } : c
          ),
        }));
      },
    }),
    {
      name: 'ollama-chat-storage',
    }
  )
);