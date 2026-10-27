import React, { useState } from 'react';
import {
  Video,
  Clock,
  Plus,
  ExternalLink,
  CheckCircle,
  RotateCcw,
  Send,
  AlertCircle,
  Layers,
  CornerDownRight,
} from 'lucide-react';
import {
  ReviewVersion,
  ReviewComment,
  ReviewVersionStatus,
} from '../../types';
import {
  getVideoEmbedInfo,
  parseTimestamp,
} from '../../hooks/useProjectCollaboration';
import { NewReviewVersionModal } from './NewReviewVersionModal';

interface ProjectReviewWorkspaceProps {
  versions: ReviewVersion[];
  activeVersion: ReviewVersion | null;
  onSelectVersion: (versionId: string) => void;
  comments: ReviewComment[];
  onAddComment: (versionId: string, data: { content: string; timestampInput?: string }) => Promise<unknown>;
  onResolveComment: (commentId: string, versionId: string) => Promise<unknown>;
  onReplyComment: (commentId: string, versionId: string, reply: string) => Promise<unknown>;
  onUpdateVersionStatus: (versionId: string, status: ReviewVersionStatus) => Promise<unknown>;
  onSubmitNewVersion: (data: { title: string; videoUrl: string; notes?: string }) => Promise<unknown>;
  userRole: 'client' | 'editor';
  isCompleted?: boolean;
}

export const ProjectReviewWorkspace: React.FC<ProjectReviewWorkspaceProps> = ({
  versions,
  activeVersion,
  onSelectVersion,
  comments,
  onAddComment,
  onResolveComment,
  onReplyComment,
  onUpdateVersionStatus,
  onSubmitNewVersion,
  userRole,
  isCompleted = false,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // New comment form state
  const [timestampInput, setTimestampInput] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Replying state
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Status updating state
  const [statusUpdating, setStatusUpdating] = useState(false);

  const embedInfo = activeVersion ? getVideoEmbedInfo(activeVersion.videoUrl) : null;

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVersion) return;

    setCommentError(null);
    const trimmed = commentContent.trim();
    if (!trimmed) {
      setCommentError('Please enter feedback content.');
      return;
    }

    if (timestampInput.trim() && !parseTimestamp(timestampInput)) {
      setCommentError('Invalid timecode. Format as MM:SS (e.g. 00:14) or HH:MM:SS.');
      return;
    }

    setSubmittingComment(true);
    try {
      await onAddComment(activeVersion.id, {
        content: trimmed,
        timestampInput: timestampInput.trim() || undefined,
      });
      setCommentContent('');
      setTimestampInput('');
    } catch (err: unknown) {
      setCommentError(err instanceof Error ? err.message : 'Failed to post review feedback.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSendReply = async (commentId: string) => {
    if (!activeVersion || !replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      await onReplyComment(commentId, activeVersion.id, replyContent.trim());
      setReplyingCommentId(null);
      setReplyContent('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to send reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleStatusChange = async (newStatus: ReviewVersionStatus) => {
    if (!activeVersion || statusUpdating) return;
    setStatusUpdating(true);
    try {
      await onUpdateVersionStatus(activeVersion.id, newStatus);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update review status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Bar: Version Switcher & Creator Upload Trigger */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '14px 20px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>
            Review Versions:
          </span>

          {versions.length === 0 ? (
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No cuts uploaded yet
            </span>
          ) : (
            versions.map((ver) => {
              const isActive = activeVersion?.id === ver.id;
              return (
                <button
                  key={ver.id}
                  type="button"
                  onClick={() => onSelectVersion(ver.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontFamily: 'var(--font-mono)',
                    border: `1px solid ${isActive ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                    background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span>V{ver.versionNumber}</span>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background:
                        ver.status === 'approved'
                          ? 'var(--accent-success)'
                          : ver.status === 'changes_requested'
                          ? 'var(--accent-danger)'
                          : '#fbbf24',
                    }}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Creator Upload Action */}
        {!isCompleted && (
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={14} />
            <span>Upload New Cut (V{versions.length + 1})</span>
          </button>
        )}
      </div>

      {/* Main Review Canvas or Empty State */}
      {!activeVersion ? (
        <div
          style={{
            padding: '64px 24px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Video size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            No Review Cuts Published Yet
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.6 }}>
            The assigned creator will submit Version 1 (rough cut) here. Both parties will be able to stream the video, add timestamped notes (e.g. 00:14), and request revisions.
          </p>
          {!isCompleted && (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Plus size={14} />
              <span>Upload Version 1 Review Cut</span>
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Active Version Info Header */}
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 14,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    background:
                      activeVersion.status === 'approved'
                        ? 'rgba(52, 211, 153, 0.15)'
                        : activeVersion.status === 'changes_requested'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(251, 191, 36, 0.15)',
                    color:
                      activeVersion.status === 'approved'
                        ? 'var(--accent-success)'
                        : activeVersion.status === 'changes_requested'
                        ? 'var(--accent-danger)'
                        : '#fbbf24',
                    border: `1px solid ${
                      activeVersion.status === 'approved'
                        ? 'rgba(52, 211, 153, 0.3)'
                        : activeVersion.status === 'changes_requested'
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(251, 191, 36, 0.3)'
                    }`,
                  }}
                >
                  {activeVersion.status === 'approved'
                    ? 'Approved Cut'
                    : activeVersion.status === 'changes_requested'
                    ? 'Revisions Requested'
                    : 'Pending Client Review'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Submitted {new Date(activeVersion.createdAt).toLocaleDateString()} by{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{activeVersion.submittedByName || 'Creator'}</strong>
                </span>
              </div>

              <h4 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {activeVersion.title}
              </h4>

              {activeVersion.notes && (
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: 1.5 }}>
                  {activeVersion.notes}
                </p>
              )}
            </div>

            {/* Client Approval Controls */}
            {userRole === 'client' && !isCompleted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleStatusChange('changes_requested')}
                  disabled={statusUpdating || activeVersion.status === 'changes_requested'}
                  className="btn btn-secondary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: 'var(--accent-danger)',
                    borderColor: activeVersion.status === 'changes_requested' ? 'var(--accent-danger)' : undefined,
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Request Changes</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusChange('approved')}
                  disabled={statusUpdating || activeVersion.status === 'approved'}
                  className="btn btn-primary btn-sm"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    background: 'var(--accent-success)',
                    borderColor: 'var(--accent-success)',
                  }}
                >
                  <CheckCircle size={14} />
                  <span>Approve This Cut</span>
                </button>
              </div>
            )}
          </div>

          {/* Video Stream Player or Cloud Link Hub */}
          <div
            style={{
              background: '#000000',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              overflow: 'hidden',
              position: 'relative',
              width: '100%',
              aspectRatio: embedInfo?.isEmbeddable ? '16 / 9' : 'auto',
              minHeight: embedInfo?.isEmbeddable ? undefined : 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {embedInfo?.isEmbeddable && embedInfo.embedUrl ? (
              embedInfo.platform === 'direct' ? (
                <video
                  src={embedInfo.embedUrl}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <iframe
                  src={embedInfo.embedUrl}
                  title={activeVersion.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )
            ) : (
              /* Cloud Drive / Frame.io Review Card */
              <div
                style={{
                  padding: '36px 24px',
                  textAlign: 'center',
                  background: 'var(--bg-surface-elevated)',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Layers size={24} />
                </div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {embedInfo?.label || 'External Cloud Review Workspace'}
                </h4>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  This review version is hosted directly on cloud master storage. Open the link below to stream or download full-bitrate master files and verify timecodes.
                </p>
                <a
                  href={activeVersion.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <span>Open Review in {embedInfo?.label.split(' ')[0] || 'Cloud'}</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>

          {/* Timecoded Feedback Section */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 14,
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} style={{ color: 'var(--accent-crimson)' }} />
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Timecoded Review Feedback
                </h4>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {comments.length} {comments.length === 1 ? 'note' : 'notes'} ({comments.filter((c) => !c.resolved).length} open)
              </span>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-muted)', fontSize: 13.5 }}>
                No review notes on this cut yet. Enter a timestamp below (e.g. <code>00:14</code>) to pinpoint adjustments.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {comments.map((comm) => (
                  <div
                    key={comm.id}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 10,
                      background: comm.resolved ? 'rgba(255, 255, 255, 0.015)' : 'var(--bg-surface-elevated)',
                      border: `1px solid ${comm.resolved ? 'var(--border-subtle)' : 'rgba(255, 255, 255, 0.08)'}`,
                      opacity: comm.resolved ? 0.7 : 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    {/* Header: Author + Timestamp + Resolve Button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {comm.timestampDisplay && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 4,
                              background: 'rgba(226, 75, 74, 0.15)',
                              color: 'var(--accent-crimson)',
                              fontFamily: 'var(--font-mono)',
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                          >
                            [{comm.timestampDisplay}]
                          </span>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {comm.authorName || (comm.authorRole === 'client' ? 'Client' : 'Lead Creator')}
                        </span>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontFamily: 'var(--font-mono)',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                          }}
                        >
                          ({comm.authorRole})
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {comm.resolved ? (
                          <span style={{ fontSize: 12, color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle size={13} />
                            <span>Resolved</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onResolveComment(comm.id, activeVersion.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 8px', fontSize: 11.5 }}
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comment Content */}
                    <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0, lineHeight: 1.55 }}>
                      {comm.content}
                    </p>

                    {/* Inline Reply if present */}
                    {comm.replyContent && (
                      <div
                        style={{
                          marginTop: 4,
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: 8,
                          borderLeft: '2px solid var(--accent-crimson)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 4,
                        }}
                      >
                        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CornerDownRight size={12} />
                          <span>Creator Response</span>
                        </div>
                        <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {comm.replyContent}
                        </div>
                      </div>
                    )}

                    {/* Reply Input Box (when replying) */}
                    {!comm.replyContent && !comm.resolved && (
                      <div>
                        {replyingCommentId === comm.id ? (
                          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Type response (e.g. Trimmed 10 frames in V2)..."
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              style={{ height: 34, fontSize: 13 }}
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => handleSendReply(comm.id)}
                              disabled={submittingReply || !replyContent.trim()}
                              className="btn btn-primary btn-sm"
                              style={{ height: 34, padding: '0 12px' }}
                            >
                              Reply
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingCommentId(null);
                                setReplyContent('');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ height: 34, padding: '0 10px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingCommentId(comm.id);
                              setReplyContent('');
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: 12,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: 0,
                            }}
                          >
                            <CornerDownRight size={12} />
                            <span>Reply to note</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Review Note Form */}
            {!isCompleted && (
              <form onSubmit={handleCreateComment} style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {commentError && (
                  <div
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 6,
                      color: 'var(--accent-danger)',
                      fontSize: 12.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <AlertCircle size={14} />
                    <span>{commentError}</span>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr auto', gap: 10, alignItems: 'flex-start' }}>
                  <div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="00:14"
                      value={timestampInput}
                      onChange={(e) => setTimestampInput(e.target.value)}
                      style={{ height: 40, fontFamily: 'var(--font-mono)', fontSize: 13 }}
                      title="Optional timecode (e.g. 00:14 or 01:22:10)"
                    />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'block' }}>
                      MM:SS (opt)
                    </span>
                  </div>

                  <div>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Leave creative note or revision request..."
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      style={{ height: 40, fontSize: 13.5 }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingComment || !commentContent.trim()}
                    className="btn btn-primary btn-sm"
                    style={{ height: 40, display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px' }}
                  >
                    <Send size={14} />
                    <span>Post Note</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Upload New Version Modal */}
      <NewReviewVersionModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        nextVersionNumber={versions.length + 1}
        onSubmitVersion={onSubmitNewVersion}
      />
    </div>
  );
};
