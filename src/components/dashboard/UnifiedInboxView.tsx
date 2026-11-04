import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Search, 
  User, 
  ChevronRight, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';
import { useInboxConversations } from '../../hooks/useInboxConversations';
import { ConversationPreview } from '../../types';

export const UnifiedInboxView: React.FC = () => {
  const navigate = useNavigate();
  const { 
    conversations, 
    totalUnreadCount, 
    loading, 
    searchQuery, 
    setSearchQuery, 
    refresh 
  } = useInboxConversations();

  const handleOpenConversation = (conversation: ConversationPreview) => {
    // Navigate directly to the project's workspace messages tab
    navigate(`/dashboard/workspace/${conversation.projectId}?tab=messages`);
  };

  const formatTimestamp = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={24} style={{ color: 'var(--accent-lavender)' }} />
            <span>Messages & Communication</span>
            {totalUnreadCount > 0 && (
              <span 
                style={{ 
                  fontSize: 12, 
                  fontWeight: 600, 
                  background: 'var(--accent-lavender)', 
                  color: '#ffffff', 
                  borderRadius: 12, 
                  padding: '2px 8px' 
                }}
              >
                {totalUnreadCount} new
              </span>
            )}
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Direct real-time conversations, file coordination, and voice/video collaboration.
          </p>
        </div>

        <button
          onClick={() => refresh()}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}
          title="Refresh inbox"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main Inbox Container */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 520,
        }}
      >
        {/* Search & Filter Toolbar */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(255, 255, 255, 0.01)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search 
              size={15} 
              style={{ 
                position: 'absolute', 
                left: 12, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)' 
              }} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by project or participant..."
              className="form-control"
              style={{
                paddingLeft: 36,
                fontSize: 13,
                height: 38,
                background: 'var(--bg-app)',
              }}
            />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent-success)' }} />
            <span>End-to-End Direct Communications</span>
          </div>
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading conversation threads...
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', maxWidth: 440, margin: '0 auto' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: 'var(--text-muted)',
                }}
              >
                <MessageSquare size={22} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                {searchQuery ? 'No matching conversations' : 'No Active Conversations Yet'}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {searchQuery
                  ? 'Try searching with a different term or clear the filter.'
                  : 'Direct conversation threads are automatically established when you create or accept a project request.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {conversations.map((conv) => {
                const hasUnread = conv.unreadCount > 0;
                return (
                  <div
                    key={conv.projectId}
                    onClick={() => handleOpenConversation(conv)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      cursor: 'pointer',
                      background: hasUnread ? 'rgba(139, 92, 246, 0.04)' : 'transparent',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = hasUnread ? 'rgba(139, 92, 246, 0.04)' : 'transparent';
                    }}
                  >
                    {/* Participant Avatar / Fallback */}
                    <div
                      style={{
                        position: 'relative',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {conv.participantAvatarUrl ? (
                        <img 
                          src={conv.participantAvatarUrl} 
                          alt={conv.participantName} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        <User size={20} style={{ color: 'var(--text-muted)' }} />
                      )}
                    </div>

                    {/* Thread Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span 
                            style={{ 
                              fontSize: 14.5, 
                              fontWeight: hasUnread ? 700 : 600, 
                              color: 'var(--text-primary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {conv.participantName}
                          </span>

                          {/* Role Pill */}
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              background: conv.participantRole === 'editor' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(96, 165, 250, 0.15)',
                              color: conv.participantRole === 'editor' ? 'var(--accent-lavender)' : '#60a5fa',
                            }}
                          >
                            {conv.participantRole === 'editor' ? 'Creator' : 'Client'}
                          </span>
                        </div>

                        {/* Timestamp */}
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                          {formatTimestamp(conv.updatedAt)}
                        </div>
                      </div>

                      {/* Project Title Context */}
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Project: {conv.projectTitle}
                      </div>

                      {/* Last Message Snippet */}
                      <div 
                        style={{ 
                          fontSize: 13, 
                          color: hasUnread ? 'var(--text-primary)' : 'var(--text-muted)', 
                          fontWeight: hasUnread ? 500 : 400,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}
                      >
                        {conv.lastMessage ? conv.lastMessage.content : 'No messages yet — start the project discussion.'}
                      </div>
                    </div>

                    {/* Unread Badge / Navigation Action */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      {hasUnread && (
                        <div
                          style={{
                            minWidth: 20,
                            height: 20,
                            padding: '0 6px',
                            borderRadius: 10,
                            background: 'var(--accent-lavender)',
                            color: '#ffffff',
                            fontSize: 11,
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {conv.unreadCount}
                        </div>
                      )}
                      <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
