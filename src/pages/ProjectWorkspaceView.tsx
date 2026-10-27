import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Video,
  MessageSquare,
  FileText,
  AlertTriangle,
  Lock,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjectCollaboration } from '../hooks/useProjectCollaboration';
import { ProjectReviewWorkspace } from '../components/workspace/ProjectReviewWorkspace';
import { ProjectMessagesThread } from '../components/workspace/ProjectMessagesThread';

export const ProjectWorkspaceView: React.FC = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuth();

  const {
    request,
    isParticipant,
    userRoleOnProject,
    loading,
    error,
    messages,
    unreadMessagesCount,
    sendMessage,
    markMessagesAsRead,
    reviewVersions,
    activeVersion,
    setActiveVersionId,
    submitReviewVersion,
    updateReviewVersionStatus,
    activeVersionComments,
    unresolvedCommentsCount,
    addReviewComment,
    resolveReviewComment,
    replyToReviewComment,
  } = useProjectCollaboration(requestId);

  const [activeTab, setActiveTab] = useState<'review' | 'messages' | 'brief'>('review');

  // When switching to messages tab, automatically mark unread messages as read
  useEffect(() => {
    if (activeTab === 'messages' && unreadMessagesCount > 0) {
      markMessagesAsRead();
    }
  }, [activeTab, unreadMessagesCount, markMessagesAsRead]);

  if (loading) {
    return (
      <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading collaboration workspace...
      </div>
    );
  }

  if (error || !request) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          borderRadius: 14,
          border: '1px solid var(--border-subtle)',
          maxWidth: 600,
          margin: '40px auto',
        }}
      >
        <AlertTriangle size={40} style={{ color: 'var(--accent-danger)', margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Project Workspace Unavailable
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          {error || 'The requested project could not be found or you do not have permission to view it.'}
        </p>
        <Link to="/dashboard/requests" className="btn btn-secondary btn-sm">
          Return to Project Requests
        </Link>
      </div>
    );
  }

  // Authorization Check
  if (!isParticipant) {
    return (
      <div
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          background: 'var(--bg-surface)',
          borderRadius: 14,
          border: '1px solid var(--border-subtle)',
          maxWidth: 540,
          margin: '40px auto',
        }}
      >
        <Lock size={40} style={{ color: 'var(--accent-crimson)', margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Access Restricted
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
          Only the client and the assigned lead creator have access to this project’s private collaboration thread and review cuts.
        </p>
        <Link to="/dashboard/requests" className="btn btn-secondary btn-sm">
          Return to My Dashboard
        </Link>
      </div>
    );
  }

  // Lifecycle stage check: Is the project active?
  const isPendingOrQuoted = request.status === 'pending' || request.status === 'quoted';
  const isDeclinedOrCancelled = request.status === 'declined' || request.status === 'cancelled';
  const isCompleted = request.status === 'completed';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
      {/* Back button & top kicker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <Link
          to="/dashboard/requests"
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <ArrowLeft size={14} />
          <span>Back to Requests</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`status-badge ${request.status}`}>
            {request.status === 'in_progress' ? 'In Production' : request.status}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Ref: {request.id.slice(0, 12)}
          </span>
        </div>
      </div>

      {/* Project Banner & Participants Header */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ maxWidth: 680 }}>
            <div className="section-kicker" style={{ marginBottom: 4 }}>
              COLLABORATION & REVIEW WORKSPACE
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              {request.title}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {request.description}
            </p>
          </div>

          {/* Pricing & Deadline Spec Block */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              padding: '12px 18px',
              borderRadius: 10,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              minWidth: 200,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
              <DollarSign size={14} />
              <span>
                Agreed Rate:{' '}
                <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>
                  {request.proposal ? `$${request.proposal.quotedPrice} USD` : request.budgetMin ? `$${request.budgetMin}` : 'Open'}
                </strong>
              </span>
            </div>

            {request.deadline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                <Calendar size={14} />
                <span>
                  Target Date: <strong style={{ color: 'var(--text-primary)' }}>{request.deadline}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Deliverables notification if completed */}
        {isCompleted && request.finalDeliverablesUrl && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 8,
              background: 'rgba(52, 211, 153, 0.08)',
              border: '1px solid rgba(52, 211, 153, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 13.5, color: 'var(--text-primary)', fontWeight: 500 }}>
              Master Project Deliverables Completed & Published
            </span>
            <a
              href={request.finalDeliverablesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}
            >
              <span>Download Master Package</span>
              <ExternalLink size={13} />
            </a>
          </div>
        )}

        {/* Participants strip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            paddingTop: 14,
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 13,
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
          }}
        >
          <div>
            Client: <strong style={{ color: 'var(--text-primary)' }}>{request.client?.fullName || 'Client Producer'}</strong>
          </div>
          <div>•</div>
          <div>
            Lead Creator:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{request.editor?.fullName || 'Assigned Editor'}</strong>
          </div>
          <div>•</div>
          <div>
            Your Role:{' '}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                color: userRoleOnProject === 'client' ? '#60a5fa' : 'var(--accent-crimson)',
                fontWeight: 600,
              }}
            >
              {userRoleOnProject}
            </span>
          </div>
        </div>
      </div>

      {/* Lifecycle Notice for Pending / Quoted / Cancelled Requests */}
      {isPendingOrQuoted && (
        <div
          style={{
            padding: '24px 28px',
            background: 'rgba(251, 191, 36, 0.08)',
            border: '1px solid rgba(251, 191, 36, 0.25)',
            borderRadius: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} style={{ color: '#fbbf24' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {request.status === 'quoted'
                ? 'Proposal Review in Progress'
                : 'Project Brief Pending Creator Review'}
            </h3>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {request.status === 'quoted'
              ? 'The creator has dispatched a quote and structured milestones. Once the client accepts this proposal, active video streaming review and direct production messaging will unlock.'
              : 'This creative brief has not yet been accepted. The collaboration workspace will activate as soon as a proposal is agreed upon.'}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <Link to="/dashboard/requests" className="btn btn-primary btn-sm">
              Manage Proposals on Dashboard
            </Link>
          </div>
        </div>
      )}

      {isDeclinedOrCancelled && (
        <div
          style={{
            padding: '24px 28px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 14,
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Project Closed ({request.status})
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
            This project brief was {request.status}. Active video review and chat are archived.
          </p>
        </div>
      )}

      {/* Active Collaboration Content (only if accepted, in_progress, or completed) */}
      {!isPendingOrQuoted && !isDeclinedOrCancelled && (
        <div>
          {/* Navigation Tabs */}
          <div className="filter-tabs" style={{ marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => setActiveTab('review')}
              className={`filter-tab ${activeTab === 'review' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Video size={14} />
              <span>Video Review & Timecodes</span>
              {unresolvedCommentsCount > 0 && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontSize: 10,
                    background: 'var(--accent-crimson)',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {unresolvedCommentsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('messages')}
              className={`filter-tab ${activeTab === 'messages' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <MessageSquare size={14} />
              <span>Project Messages</span>
              {unreadMessagesCount > 0 && (
                <span
                  style={{
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontSize: 10,
                    background: '#60a5fa',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('brief')}
              className={`filter-tab ${activeTab === 'brief' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <FileText size={14} />
              <span>Scope & Milestones</span>
            </button>
          </div>

          {/* Tab 1: Video Review & Timecodes */}
          {activeTab === 'review' && (
            <ProjectReviewWorkspace
              versions={reviewVersions}
              activeVersion={activeVersion}
              onSelectVersion={setActiveVersionId}
              comments={activeVersionComments}
              onAddComment={addReviewComment}
              onResolveComment={resolveReviewComment}
              onReplyComment={replyToReviewComment}
              onUpdateVersionStatus={updateReviewVersionStatus}
              onSubmitNewVersion={submitReviewVersion}
              userRole={userRoleOnProject || 'client'}
              isCompleted={isCompleted}
            />
          )}

          {/* Tab 2: Messages Thread */}
          {activeTab === 'messages' && (
            <div style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
              <ProjectMessagesThread
                messages={messages}
                onSendMessage={sendMessage}
                currentUserId={user?.id || ''}
                disabled={isDeclinedOrCancelled}
              />
            </div>
          )}

          {/* Tab 3: Scope & Milestones breakdown */}
          {activeTab === 'brief' && (
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              <div>
                <label className="text-caption" style={{ display: 'block', marginBottom: 4 }}>
                  Full Creative Brief & Scope
                </label>
                <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {request.description}
                </p>
              </div>

              {request.deliverables && (
                <div>
                  <label className="text-caption" style={{ display: 'block', marginBottom: 4 }}>
                    Expected Deliverables
                  </label>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                    {request.deliverables}
                  </p>
                </div>
              )}

              {/* Proposal Milestones */}
              {request.proposal?.milestones && request.proposal.milestones.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Layers size={14} style={{ color: 'var(--text-muted)' }} />
                    <label className="text-caption">STRUCTURED MILESTONE SCHEDULE</label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
                    {request.proposal.milestones.map((ms, idx) => (
                      <div
                        key={ms.id || idx}
                        style={{
                          padding: '12px 16px',
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                          {ms.title}
                        </span>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                          ${ms.amount} ({ms.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
