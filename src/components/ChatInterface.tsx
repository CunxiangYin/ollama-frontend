import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PaperClipIcon, StopIcon } from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';
import { OllamaService } from '../services/ollamaService';
import { MessageItem } from './MessageItem';
import { Message } from '../types';

export const ChatInterface: React.FC = () => {
  const {
    conversations,
    currentConversationId,
    addMessage,
    updateMessage,
    settings,
    isConnected,
  } = useStore();

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || !currentConversationId || !currentConversation || !isConnected) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(currentConversationId, userMessage);
    setInput('');
    setIsGenerating(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    addMessage(currentConversationId, assistantMessage);

    try {
      const service = new OllamaService(settings.ollama.baseUrl, settings.ollama.port);
      let fullContent = '';

      const generator = service.streamChat(
        currentConversation.messages.concat(userMessage),
        currentConversation.modelConfig,
        (chunk) => {
          fullContent += chunk;
          updateMessage(currentConversationId, assistantMessageId, fullContent);
        }
      );

      for await (const _ of generator) {
        // Stream is being handled in the callback
      }
    } catch (error) {
      console.error('Chat error:', error);
      updateMessage(
        currentConversationId,
        assistantMessageId,
        'Error: Failed to generate response. Please check your connection settings.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (messageIndex: number) => {
    if (!currentConversationId || !currentConversation || !isConnected) return;

    const messagesToSend = currentConversation.messages.slice(0, messageIndex);
    if (messagesToSend.length === 0) return;

    setIsGenerating(true);
    const assistantMessageId = currentConversation.messages[messageIndex].id;

    try {
      const service = new OllamaService(settings.ollama.baseUrl, settings.ollama.port);
      let fullContent = '';

      const generator = service.streamChat(
        messagesToSend,
        currentConversation.modelConfig,
        (chunk) => {
          fullContent += chunk;
          updateMessage(currentConversationId, assistantMessageId, fullContent);
        }
      );

      for await (const _ of generator) {
        // Stream is being handled in the callback
      }
    } catch (error) {
      console.error('Regenerate error:', error);
      updateMessage(
        currentConversationId,
        assistantMessageId,
        'Error: Failed to regenerate response. Please check your connection settings.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentConversationId || !currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--claude-bg-primary)' }}>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--claude-text-primary)' }}>
            Welcome to Ollama Chat
          </h2>
          <p style={{ color: 'var(--claude-text-secondary)' }}>
            Start a conversation to explore AI capabilities
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full" style={{ background: 'var(--claude-bg-primary)' }}>
      {/* Header */}
      <div className="px-6 py-3 border-b" style={{ borderColor: 'var(--claude-border-light)', background: 'var(--claude-bg-secondary)' }}>
        <div className="flex items-center justify-between">
          <h1 className="font-semibold" style={{ 
            color: 'var(--claude-text-primary)',
            fontSize: '16px',
            fontWeight: 600
          }}>
            {currentConversation.title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded" style={{ 
              background: 'var(--claude-hover)', 
              color: 'var(--claude-text-secondary)',
              fontSize: '13px',
              fontWeight: 500
            }}>
              {currentConversation.modelConfig.model}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {currentConversation.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center max-w-md">
                <h3 className="mb-2" style={{ 
                  color: 'var(--claude-text-primary)',
                  fontSize: '18px',
                  fontWeight: 500
                }}>
                  How can I help you today?
                </h3>
                <p style={{ 
                  color: 'var(--claude-text-secondary)',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  Ask me anything - from creative writing to technical questions
                </p>
              </div>
            </div>
          ) : (
            <div className="py-6">
              {currentConversation.messages.map((message, index) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  onRegenerate={
                    message.role === 'assistant'
                      ? () => handleRegenerate(index)
                      : undefined
                  }
                  onEdit={
                    message.role === 'user'
                      ? (content) => updateMessage(currentConversationId, message.id, content)
                      : undefined
                  }
                />
              ))}
              {isGenerating && (
                <div className="flex justify-center py-3">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--claude-text-secondary)' }}>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t" style={{ borderColor: 'var(--claude-border-light)', background: 'var(--claude-bg-secondary)' }}>
        <div className="max-w-4xl mx-auto px-6 py-4">
          {!isConnected && (
            <div className="mb-3 px-3 py-2 rounded-lg text-sm" style={{ background: '#fee', color: '#c00' }}>
              Not connected to Ollama. Please check your settings.
            </div>
          )}
          <div className="relative flex items-end gap-2">
            <button
              className="p-2.5 rounded-lg transition-colors"
              style={{ 
                color: 'var(--claude-text-tertiary)',
                background: 'var(--claude-hover)'
              }}
              title="Attach file"
              disabled
            >
              <PaperClipIcon className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Reply to Claude..."
                disabled={!isConnected || isGenerating}
                className="w-full px-4 py-3 resize-none rounded-lg focus:outline-none transition-all"
                style={{
                  background: 'var(--claude-input-bg)',
                  color: 'var(--claude-text-primary)',
                  border: '1px solid var(--claude-border)',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  fontWeight: 400,
                  minHeight: '48px',
                  maxHeight: '200px'
                }}
                rows={1}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!isConnected || !input.trim() || isGenerating}
              className="p-2.5 rounded-lg transition-all duration-200 disabled:opacity-30"
              style={{
                background: input.trim() && !isGenerating ? 'var(--claude-accent)' : 'var(--claude-hover)',
                color: input.trim() && !isGenerating ? 'white' : 'var(--claude-text-tertiary)'
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !isGenerating) {
                  e.currentTarget.style.background = 'var(--claude-accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (input.trim() && !isGenerating) {
                  e.currentTarget.style.background = 'var(--claude-accent)';
                }
              }}
            >
              {isGenerating ? (
                <StopIcon className="w-5 h-5" />
              ) : (
                <PaperAirplaneIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="mt-2 text-xs text-center" style={{ color: 'var(--claude-text-tertiary)' }}>
            Claude can make mistakes. Please double-check responses.
          </div>
        </div>
      </div>
    </div>
  );
};