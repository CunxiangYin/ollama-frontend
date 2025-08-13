import React, { useState } from 'react';
import { PlusIcon, ChatBubbleLeftIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';

interface SidebarProps {
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  theme: 'light' | 'dark';
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings }) => {
  const {
    conversations,
    currentConversationId,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
  } = useStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleRename = (id: string) => {
    if (editingTitle.trim()) {
      renameConversation(id, editingTitle);
    }
    setEditingId(null);
    setEditingTitle('');
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  return (
    <div 
      className="w-72 flex flex-col h-full"
      style={{ 
        background: 'var(--claude-sidebar-bg)',
        borderRight: '1px solid var(--claude-border-light)'
      }}
    >
      {/* New Chat Button */}
      <div className="p-4 pb-3">
        <button
          onClick={createConversation}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg btn-hover"
          style={{ 
            background: 'var(--claude-accent)',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--claude-accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--claude-accent)';
          }}
        >
          <PlusIcon className="w-4 h-4" strokeWidth={2} />
          <span>New chat</span>
        </button>
      </div>

      {/* Section Headers */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2" style={{ 
          color: 'var(--claude-text-tertiary)',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.05em'
        }}>
          <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
          <span>CHATS</span>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            onClick={() => selectConversation(conversation.id)}
            className={`group relative px-3 py-2 mb-0.5 rounded-lg cursor-pointer transition-all duration-150 ${
              currentConversationId === conversation.id ? 'bg-white/50 dark:bg-white/5' : ''
            }`}
            style={{
              background: currentConversationId === conversation.id 
                ? 'var(--claude-bg-secondary)' 
                : 'transparent',
            }}
            onMouseEnter={(e) => {
              if (currentConversationId !== conversation.id) {
                e.currentTarget.style.background = 'var(--claude-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentConversationId !== conversation.id) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {editingId === conversation.id ? (
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleRename(conversation.id)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleRename(conversation.id);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-transparent px-1 py-0.5 text-sm focus:outline-none"
                style={{ 
                  border: '1px solid var(--claude-accent)',
                  borderRadius: '4px',
                  color: 'var(--claude-text-primary)'
                }}
                autoFocus
              />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div 
                    className="truncate"
                    style={{ 
                      color: currentConversationId === conversation.id 
                        ? 'var(--claude-text-primary)' 
                        : 'var(--claude-text-secondary)',
                      fontWeight: currentConversationId === conversation.id ? 500 : 400,
                      fontSize: '14px'
                    }}
                  >
                    {conversation.title}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-150">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(conversation.id, conversation.title);
                    }}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ color: 'var(--claude-text-tertiary)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ color: 'var(--claude-text-tertiary)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--claude-border-light)' }}>
        <div className="space-y-2">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{ 
              color: 'var(--claude-text-secondary)',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--claude-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Cog6ToothIcon className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};