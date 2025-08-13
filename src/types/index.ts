export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  modelConfig: ModelConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelConfig {
  model: string;
  temperature: number;
  topP: number;
  topK: number;
  repeatPenalty: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface OllamaConfig {
  baseUrl: string;
  port: number;
}

export interface AppSettings {
  ollama: OllamaConfig;
  theme: 'light' | 'dark';
  fontSize: number;
}

export interface Model {
  name: string;
  modified_at: string;
  size: number;
}