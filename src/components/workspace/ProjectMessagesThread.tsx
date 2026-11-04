import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  AlertCircle, 
  MessageSquare, 
  Phone, 
  Video, 
  PhoneIncoming, 
  Check, 
  X 
} from 'lucide-react';
import { ProjectMessage, CallInvitation } from '../../types';

interface ProjectMessagesThreadProps {
  messages: ProjectMessage[];
  onSendMessage: (content: string) => Promise<unknown>;
  currentUserId: string;
  disabled?: boolean;
  onStartVoiceCall?: () => void;
  onStartVideoCall?: () => void;
  incomingCall?: CallInvitation | null;
  onAcceptCall?: () => void;
  onDeclineCall?: () => void;
  recipientName?: string;
}

function renderMessageContent(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--accent-lavender)',
            textDecoration: 'underline',
            wordBreak: 'break-all',
          }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export const ProjectMessagesThread: React.FC<ProjectMessagesThreadProps> = ({
  messages,
  onSendMessage,
  currentUserId,
  disabled = false,
  onStartVoiceCall,
  onStartVideoCall,
  incomingCall,
  onAcceptCall,
  onDeclineCall,
  recipientName,
}) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || sending || disabled) return;

    if (trimmed.length > 3000) {
      setError('Message exceeds the maximum limit of 3,000 characters.');
      return;
    }

    setError(null);
    setSending(true);
    try {
      await onSendMessage(trimmed);
      setContent('');
      textareaRef.current?.focus();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 520,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Messages Header */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.01)',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquare size={16} style={{ color: 'var(--accent-lavender)' }} />
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Project Conversation
            </span>
            {recipientName && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>
                with <strong style={{ color: 'var(--text-secondary)' }}>{recipientName}</strong>
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Voice & Video Call Action Buttons */}
          {(onStartVoiceCall || onStartVideoCall) && !disabled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {onStartVoiceCall && (
                <button
                  type="button"
                  onClick={onStartVoiceCall}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    fontSize: 12,
                  }}
                  title="Start Voice Call"
                >
                  <Phone size={13} style={{ color: 'var(--text-secondary)' }} />
                  <span>Voice Call</span>
                </button>
              )}
              {onStartVideoCall && (
                <button
                  type="button"
                  onClick={onStartVideoCall}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    fontSize: 12,
                  }}
                  title="Start Video Call"
                >
                  <Video size={13} style={{ color: 'var(--text-secondary)' }} />
                  <span>Video Call</span>
                </button>
              )}
            </div>
          )}

          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </div>
        </div>
      </div>

      {/* Incoming Call Notification Banner */}
      {incomingCall && incomingCall.status === 'ringing' && (
        <div
          style={{
            padding: '12px 20px',
            background: 'rgba(139, 92, 246, 0.12)',
            borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'pulse 2s infinite',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--accent-lavender)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhoneIncoming size={18} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                Incoming {incomingCall.callType === 'video' ? 'Video' : 'Voice'} Call...
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                {incomingCall.callerName || 'Project collaborator'} is calling you
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {onDeclineCall && (
              <button
                type="button"
                onClick={onDeclineCall}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                }}
              >
                <X size={14} />
                <span>Decline</span>
              </button>
            )}
            {onAcceptCall && (
              <button
                type="button"
                onClick={onAcceptCall}
                className="btn btn-primary btn-sm"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 14px',
                  fontSize: 12,
                  background: '#10b981',
                  borderColor: '#059669',
                }}
              >
                <Check size={14} />
                <span>Accept</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Messages Scrollable Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              padding: '32px 16px',
              maxWidth: 380,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                color: 'var(--text-muted)',
              }}
            >
              <MessageSquare size={20} />
            </div>
            <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Direct Project Thread
            </h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Use this channel to exchange raw asset drives, discuss sound and edit pacing, and coordinate project delivery.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '82%',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Sender Identity & Role Pill */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 4,
                    fontSize: 11.5,
                    color: 'var(--text-muted)',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {isMe ? 'You' : msg.senderName || (msg.senderRole === 'client' ? 'Client' : 'Lead Creator')}
                  </span>
                  <span
                    style={{
                      padding: '1px 5px',
                      borderRadius: 3,
                      fontSize: 10,
                      fontFamily: 'var(--font-mono)',
                      background: msg.senderRole === 'client' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                      color: msg.senderRole === 'client' ? '#60a5fa' : 'var(--accent-lavender)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {msg.senderRole}
                  </span>
                  <span>•</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Bubble */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    borderTopRightRadius: isMe ? 2 : 12,
                    borderTopLeftRadius: !isMe ? 2 : 12,
                    background: isMe ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isMe ? 'rgba(139, 92, 246, 0.28)' : 'var(--border-subtle)'}`,
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    lineHeight: 1.55,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div
          style={{
            padding: '8px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderTop: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--accent-danger)',
            fontSize: 12.5,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Message Compose Box */}
      <div
        style={{
          padding: '14px 18px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-app)',
        }}
      >
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            rows={2}
            disabled={disabled || sending}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? 'Collaboration thread is currently locked for this project status.'
                : 'Write a message... (Press Enter to send, Shift+Enter for newline)'
            }
            className="form-control"
            style={{
              paddingRight: 50,
              resize: 'none',
              fontSize: 13.5,
              height: 64,
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || sending || !content.trim()}
            style={{
              position: 'absolute',
              right: 10,
              bottom: 12,
              width: 32,
              height: 32,
              borderRadius: 6,
              background: content.trim() ? 'var(--accent-lavender)' : 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: content.trim() ? 'pointer' : 'not-allowed',
              opacity: content.trim() ? 1 : 0.4,
              transition: 'background var(--transition-fast), opacity var(--transition-fast)',
            }}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
            fontSize: 11.5,
            color: 'var(--text-muted)',
          }}
        >
          <span>Shift + Enter for new lines</span>
          <span>{content.length} / 3000</span>
        </div>
      </div>
    </div>
  );
};
