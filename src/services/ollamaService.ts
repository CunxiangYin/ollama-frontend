import axios from 'axios';
import { Message, ModelConfig, Model } from '../types';

export class OllamaService {
  private baseUrl: string;

  constructor(baseUrl: string, port: number) {
    // 如果是localhost:3000，使用相对路径（通过代理）
    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
      this.baseUrl = '';
    } else {
      this.baseUrl = `${baseUrl}:${port}`;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.status === 200;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getModels(): Promise<Model[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      console.error('Failed to fetch models:', error);
      return [];
    }
  }

  async *streamChat(
    messages: Message[],
    config: ModelConfig,
    onChunk?: (chunk: string) => void
  ): AsyncGenerator<string, void, unknown> {
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    if (config.systemPrompt) {
      formattedMessages.unshift({
        role: 'system',
        content: config.systemPrompt,
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: formattedMessages,
          stream: true,
          options: {
            temperature: config.temperature,
            top_p: config.topP,
            top_k: config.topK,
            repeat_penalty: config.repeatPenalty,
            num_predict: config.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              const content = json.message.content;
              if (onChunk) onChunk(content);
              yield content;
            }
          } catch (e) {
            console.error('Failed to parse JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Chat stream error:', error);
      throw error;
    }
  }

  async chat(
    messages: Message[],
    config: ModelConfig
  ): Promise<string> {
    const chunks: string[] = [];
    const generator = this.streamChat(messages, config);
    
    for await (const chunk of generator) {
      chunks.push(chunk);
    }
    
    return chunks.join('');
  }
}