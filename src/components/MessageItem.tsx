import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardIcon, ArrowPathIcon, PencilIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  onRegenerate?: () => void;
  onEdit?: (content: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onRegenerate, onEdit }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(editContent);
      setIsEditing(false);
    }
  };

  return (
    <div 
      className="group relative px-6 py-6 transition-colors"
      style={{ 
        background: message.role === 'assistant' 
          ? 'var(--claude-message-assistant)' 
          : 'var(--claude-message-user)',
        borderBottom: '1px solid var(--claude-border-light)'
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold"
              style={{
                background: message.role === 'user' 
                  ? 'var(--claude-text-primary)' 
                  : 'var(--claude-accent)',
                color: message.role === 'user' 
                  ? 'var(--claude-bg-primary)' 
                  : 'white'
              }}
            >
              {message.role === 'user' ? 'H' : 'A'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <span 
                className="font-semibold"
                style={{ 
                  color: 'var(--claude-text-primary)',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                {message.role === 'user' ? 'Human' : 'Assistant'}
              </span>
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 rounded-lg resize-none focus:outline-none focus:ring-2"
                  style={{
                    background: 'var(--claude-input-bg)',
                    border: '1px solid var(--claude-border)',
                    color: 'var(--claude-text-primary)',
                    minHeight: '100px',
                    fontSize: '15px',
                    lineHeight: '1.6'
                  }}
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: 'var(--claude-accent)',
                      color: 'white'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(message.content);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: 'var(--claude-hover)',
                      color: 'var(--claude-text-primary)'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none"
                style={{ 
                  color: 'var(--claude-text-primary)',
                  fontSize: '15px',
                  lineHeight: '1.75',
                  fontWeight: 400
                }}
              >
                <ReactMarkdown
                  components={{
                    code({ className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const inline = !match;
                      return !inline && match ? (
                        <div className="my-3">
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: '8px',
                              fontSize: '14px',
                              padding: '16px',
                              background: '#1e1e1e',
                              lineHeight: '1.6'
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code 
                          className="px-1.5 py-0.5 rounded"
                          style={{
                            background: 'var(--claude-hover)',
                            color: 'var(--claude-accent)',
                            fontFamily: 'SF Mono, Monaco, monospace',
                            fontSize: '0.9em',
                            fontWeight: 500
                          }}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => (
                      <p className="mb-4" style={{ 
                        color: 'var(--claude-text-primary)',
                        lineHeight: '1.75',
                        fontSize: '15px'
                      }}>
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 pl-6 list-disc" style={{ color: 'var(--claude-text-primary)' }}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 pl-6 list-decimal" style={{ color: 'var(--claude-text-primary)' }}>
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-1" style={{ color: 'var(--claude-text-primary)' }}>
                        {children}
                      </li>
                    ),
                    h1: ({ children }) => (
                      <h1 className="mb-4 mt-6" style={{ 
                        color: 'var(--claude-text-primary)',
                        fontSize: '24px',
                        fontWeight: 600,
                        lineHeight: '1.3'
                      }}>
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-3 mt-5" style={{ 
                        color: 'var(--claude-text-primary)',
                        fontSize: '20px',
                        fontWeight: 600,
                        lineHeight: '1.3'
                      }}>
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 mt-4" style={{ 
                        color: 'var(--claude-text-primary)',
                        fontSize: '18px',
                        fontWeight: 600,
                        lineHeight: '1.3'
                      }}>
                        {children}
                      </h3>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote 
                        className="border-l-4 pl-4 my-4 italic"
                        style={{ 
                          borderColor: 'var(--claude-accent)',
                          color: 'var(--claude-text-secondary)'
                        }}
                      >
                        {children}
                      </blockquote>
                    ),
                    a: ({ children, href }) => (
                      <a 
                        href={href} 
                        className="underline hover:no-underline transition-all"
                        style={{ color: 'var(--claude-accent)' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => (
                      <strong style={{ 
                        fontWeight: 600, 
                        color: 'var(--claude-text-primary)' 
                      }}>
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em style={{ fontStyle: 'italic' }}>
                        {children}
                      </em>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10"
                style={{ color: 'var(--claude-text-tertiary)' }}
                title="Copy message"
              >
                {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
              </button>
              
              {message.role === 'user' && onEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ color: 'var(--claude-text-tertiary)' }}
                  title="Edit message"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
              )}
              
              {message.role === 'assistant' && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10"
                  style={{ color: 'var(--claude-text-tertiary)' }}
                  title="Regenerate response"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};