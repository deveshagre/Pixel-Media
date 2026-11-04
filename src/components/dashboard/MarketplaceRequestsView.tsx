import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Calendar,
  DollarSign,
  XCircle,
  ExternalLink,
  Search,
  FileText,
  Send,
  CheckCircle,
  Play,
  Layers,
  Check,
  Sparkles,
  Video,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjectRequests } from '../../hooks/useMarketplace';
import { ProjectRequest, RequestStatus } from '../../types';
import { ProjectProposalModal } from '../marketplace/ProjectProposalModal';

export const MarketplaceRequestsView: React.FC = () => {
  const { user } = useAuth();
  const {
    requests,
    loading,
    submitProposal,
    acceptProposal,
    declineProposal,
    markInProgress,
    completeProject,
    cancelRequest,
    updateRequestStatus,
  } = useProjectRequests();

  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [proposalModalRequest, setProposalModalRequest] = useState<ProjectRequest | null>(null);

  // Deliverables modal / prompt state
  const [deliverablesPromptRequest, setDeliverablesPromptRequest] = useState<ProjectRequest | null>(null);
  const [deliverablesUrlInput, setDeliverablesUrlInput] = useState('');

  // Action status state
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isEditor = user?.role === 'editor';

  const showNotification = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleAcceptProposal = async (requestId: string) => {
    setUpdatingId(requestId);
    try {
      await acceptProposal(requestId);
      showNotification('Proposal accepted! The creator has been commissioned.');
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: 'accepted' });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to accept proposal.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeclineProposal = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to decline this proposal?')) return;
    setUpdatingId(requestId);
    try {
      await declineProposal(requestId);
      showNotification('Proposal declined.');
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: 'declined' });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to decline proposal.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkInProgress = async (requestId: string) => {
    setUpdatingId(requestId);
    try {
      await markInProgress(requestId);
      showNotification('Project marked as actively in production.');
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: 'in_progress' });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDeliverablesModal = (req: ProjectRequest) => {
    setDeliverablesPromptRequest(req);
    setDeliverablesUrlInput(req.finalDeliverablesUrl || '');
  };

  const handleSubmitCompletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverablesPromptRequest) return;
    setUpdatingId(deliverablesPromptRequest.id);
    try {
      await completeProject(deliverablesPromptRequest.id, deliverablesUrlInput.trim() || undefined);
      showNotification('Project marked as completed and deliverables submitted!');
      if (selectedRequest?.id === deliverablesPromptRequest.id) {
        setSelectedRequest({
          ...selectedRequest,
          status: 'completed',
          finalDeliverablesUrl: deliverablesUrlInput.trim() || undefined,
        });
      }
      setDeliverablesPromptRequest(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to complete project.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to cancel this project brief?')) return;
    setUpdatingId(requestId);
    try {
      await cancelRequest(requestId);
      showNotification('Project brief cancelled.');
      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: 'cancelled' });
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel brief.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered =
    filterStatus === 'all'
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    quoted: requests.filter((r) => r.status === 'quoted').length,
    accepted: requests.filter((r) => r.status === 'accepted').length,
    in_progress: requests.filter((r) => r.status === 'in_progress').length,
    completed: requests.filter((r) => r.status === 'completed').length,
    declined: requests.filter((r) => r.status === 'declined').length,
    cancelled: requests.filter((r) => r.status === 'cancelled').length,
  };

  return (
    <div>
      {/* Toast Notification */}
      {actionFeedback && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--accent-success)',
            padding: '12px 20px',
            borderRadius: 8,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
          }}
        >
          <CheckCircle size={18} style={{ color: 'var(--accent-success)' }} />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 className="text-title-1" style={{ marginBottom: 4 }}>
            {isEditor ? 'Incoming Client Requests & Quotes' : 'My Project Briefs & Proposals'}
          </h2>
          <p className="text-body">
            {isEditor
              ? 'Review client creative briefs, dispatch formal quotes with structured milestone agreements, and deliver project files.'
              : 'Track submitted briefs, review creator proposals, approve milestone agreements, and download deliverables.'}
          </p>
        </div>

        {!isEditor && (
          <Link to="/explore" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={15} />
            <span>Discover Creators</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 24, overflowX: 'auto', display: 'flex', gap: 6 }}>
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending Review' },
            { id: 'quoted', label: 'Quoted / Proposals' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'in_progress', label: 'In Production' },
            { id: 'completed', label: 'Completed' },
            { id: 'declined', label: 'Declined' },
          ] as const
        ).map((tab) => {
          const count = statusCounts[tab.id as keyof typeof statusCounts] || 0;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id as RequestStatus | 'all')}
              className={`filter-tab ${filterStatus === tab.id ? 'active' : ''}`}
              style={{ whiteSpace: 'nowrap' }}
            >
              {tab.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Requests List */}
      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading requests...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Inbox size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>
            {isEditor ? 'No briefs in this section' : 'No project briefs found'}
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
            {isEditor
              ? 'When clients discover your talent profile and commission a brief, it will appear here.'
              : 'Browse our vetted directory of independent editors to commission your next project.'}
          </p>
          {!isEditor && (
            <Link to="/explore" className="btn btn-primary btn-sm">
              Explore Talent
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((req) => (
            <div
              key={req.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                transition: 'border-color var(--transition-fast)',
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className={`status-badge ${req.status}`}>
                      {req.status === 'in_progress' ? 'In Production' : req.status}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Submitted {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {req.title}
                  </h3>
                </div>

                {/* Right metadata / primary actions */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(req)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <FileText size={14} />
                    <span>Brief Details</span>
                  </button>

                  {(req.status === 'accepted' || req.status === 'in_progress' || req.status === 'completed') && (
                    <>
                      <Link
                        to={`/dashboard/workspace/${req.id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-primary)' }}
                      >
                        <Video size={14} />
                        <span>Workspace</span>
                      </Link>
                      <Link
                        to={`/dashboard/workspace/${req.id}?tab=messages`}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-primary)' }}
                        title="Direct chat and calls"
                      >
                        <MessageSquare size={14} style={{ color: 'var(--accent-lavender)' }} />
                        <span>Chat & Calls</span>
                      </Link>
                    </>
                  )}

                  {/* Actions for Editor */}
                  {isEditor && req.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setProposalModalRequest(req)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        <Send size={14} />
                        <span>Send Quote & Scope</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRequestStatus(req.id, 'accepted')}
                        disabled={updatingId === req.id}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--accent-success)' }}
                      >
                        Accept Directly
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRequestStatus(req.id, 'declined')}
                        disabled={updatingId === req.id}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--accent-danger)' }}
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {isEditor && req.status === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => handleMarkInProgress(req.id)}
                      disabled={updatingId === req.id}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <Play size={14} />
                      <span>Start Production</span>
                    </button>
                  )}

                  {isEditor && (req.status === 'in_progress' || req.status === 'accepted') && (
                    <button
                      type="button"
                      onClick={() => handleOpenDeliverablesModal(req)}
                      disabled={updatingId === req.id}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent-success)' }}
                    >
                      <CheckCircle size={14} />
                      <span>Deliver Master & Complete</span>
                    </button>
                  )}

                  {/* Actions for Client */}
                  {!isEditor && req.status === 'pending' && (
                    <button
                      type="button"
                      onClick={() => handleCancelRequest(req.id)}
                      disabled={updatingId === req.id}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--accent-danger)' }}
                    >
                      Cancel Brief
                    </button>
                  )}

                  {!isEditor && req.status === 'quoted' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAcceptProposal(req.id)}
                        disabled={updatingId === req.id}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}
                      >
                        <Check size={14} />
                        <span>Accept Proposal & Commission</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeclineProposal(req.id)}
                        disabled={updatingId === req.id}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--accent-danger)' }}
                      >
                        Decline Quote
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                {req.description}
              </p>

              {/* Active Proposal Card (when proposal exists or status is quoted) */}
              {req.proposal && (
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    borderRadius: 10,
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={16} style={{ color: '#60a5fa' }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Creator Formal Quote & Proposal
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13 }}>
                      <span>
                        Quoted Total:{' '}
                        <strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>
                          ${req.proposal.quotedPrice} USD
                        </strong>
                      </span>
                      <span>
                        Est. Delivery:{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {req.proposal.estimatedDelivery}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {req.proposal.scopeSummary && (
                    <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Scope: </strong>
                      {req.proposal.scopeSummary}
                    </div>
                  )}

                  {/* Milestones list */}
                  {req.proposal.milestones && req.proposal.milestones.length > 0 && (
                    <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                        <Layers size={13} />
                        <span>STRUCTURED MILESTONE AGREEMENTS</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
                        {req.proposal.milestones.map((ms, idx) => (
                          <div
                            key={ms.id || idx}
                            style={{
                              padding: '8px 12px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 6,
                              fontSize: 12.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span style={{ color: 'var(--text-primary)' }}>{ms.title}</span>
                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                              ${ms.amount} ({ms.percentage}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Final deliverables banner if completed */}
              {req.status === 'completed' && req.finalDeliverablesUrl && (
                <div
                  style={{
                    background: 'rgba(52, 211, 153, 0.08)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    borderRadius: 10,
                    padding: '12px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
                    <CheckCircle size={16} style={{ color: 'var(--accent-success)' }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      Final Master Deliverables Ready for Download
                    </span>
                  </div>
                  <a
                    href={req.finalDeliverablesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' }}
                  >
                    <span>Access Files</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}

              {/* Spec row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 20,
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                {req.deadline && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} />
                    <span>Target Date: <strong style={{ color: 'var(--text-primary)' }}>{req.deadline}</strong></span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DollarSign size={14} />
                  <span>
                    Initial Budget:{' '}
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {req.requestQuote
                        ? 'Custom Quote Requested'
                        : req.budgetMin && req.budgetMax
                        ? `$${req.budgetMin} – $${req.budgetMax}`
                        : req.budgetMin
                        ? `From $${req.budgetMin}`
                        : 'Open'}
                    </strong>
                  </span>
                </div>

                {req.deliverables && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>Deliverables: <strong style={{ color: 'var(--text-primary)' }}>{req.deliverables}</strong></span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creator Proposal Submission Modal */}
      {proposalModalRequest && (
        <ProjectProposalModal
          isOpen={Boolean(proposalModalRequest)}
          onClose={() => setProposalModalRequest(null)}
          request={proposalModalRequest}
          onSubmitProposal={submitProposal}
          onSuccess={() => {
            showNotification('Formal quote sent to client!');
            setProposalModalRequest(null);
          }}
        />
      )}

      {/* Complete Project / Submit Deliverables Modal */}
      {deliverablesPromptRequest && (
        <div className="modal-overlay" onClick={() => setDeliverablesPromptRequest(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                Complete Project & Submit Deliverables
              </h3>
              <button
                type="button"
                onClick={() => setDeliverablesPromptRequest(null)}
                className="mobile-menu-btn"
                style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitCompletion}>
              <div className="modal-body" style={{ gap: 16 }}>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Provide the link to the client's final master video exports, cloud drive (Google Drive, Dropbox, Frame.io, or Vimeo Review), or project package.
                </p>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="text-caption" style={{ display: 'block', marginBottom: 6 }}>
                    Deliverables Cloud URL (Drive / Frame.io / Vimeo) *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="form-control"
                    value={deliverablesUrlInput}
                    onChange={(e) => setDeliverablesUrlInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 24px' }}>
                <button
                  type="button"
                  onClick={() => setDeliverablesPromptRequest(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingId === deliverablesPromptRequest.id}
                  className="btn btn-primary btn-sm"
                >
                  {updatingId === deliverablesPromptRequest.id ? 'Submitting...' : 'Mark Completed & Deliver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Full Brief Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <span className={`status-badge ${selectedRequest.status}`} style={{ marginBottom: 6 }}>
                  {selectedRequest.status === 'in_progress' ? 'In Production' : selectedRequest.status}
                </span>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedRequest.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="mobile-menu-btn"
                style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: 16 }}>
              <div>
                <label className="text-caption" style={{ display: 'block', marginBottom: 4 }}>
                  Full Scope & Creative Brief
                </label>
                <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {selectedRequest.description}
                </p>
              </div>

              {selectedRequest.deliverables && (
                <div>
                  <label className="text-caption" style={{ display: 'block', marginBottom: 4 }}>
                    Expected Deliverables
                  </label>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                    {selectedRequest.deliverables}
                  </p>
                </div>
              )}

              {selectedRequest.proposal && (
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <label className="text-caption" style={{ display: 'block', marginBottom: 6, color: '#60a5fa' }}>
                    Active Creator Proposal & Milestones
                  </label>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>
                    Quoted Price: <strong>${selectedRequest.proposal.quotedPrice} USD</strong> • Delivery:{' '}
                    <strong>{selectedRequest.proposal.estimatedDelivery}</strong>
                  </div>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    {selectedRequest.proposal.scopeSummary}
                  </p>

                  {selectedRequest.proposal.milestones && selectedRequest.proposal.milestones.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {selectedRequest.proposal.milestones.map((ms, idx) => (
                        <div
                          key={ms.id || idx}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: 12.5,
                            padding: '6px 10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 4,
                          }}
                        >
                          <span>{ms.title}</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>${ms.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedRequest.finalDeliverablesUrl && (
                <div>
                  <label className="text-caption" style={{ display: 'block', marginBottom: 4 }}>
                    Master Deliverables Link
                  </label>
                  <a
                    href={selectedRequest.finalDeliverablesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 14, color: 'var(--accent-lavender)', textDecoration: 'underline', textUnderlineOffset: 3, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <ExternalLink size={14} />
                    <span>{selectedRequest.finalDeliverablesUrl}</span>
                  </a>
                </div>
              )}

              {selectedRequest.referenceLinks && selectedRequest.referenceLinks.length > 0 && (
                <div>
                  <label className="text-caption" style={{ display: 'block', marginBottom: 6 }}>
                    Inspiration & Reference Links
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selectedRequest.referenceLinks.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 13, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3, display: 'flex', alignItems: 'center', gap: 4 }}
                      >
                        <ExternalLink size={13} />
                        <span>{url}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.additionalNotes && (
                <div>
                  <label className="text-caption" style={{ display: 'block', marginBottom: 4 }}>
                    Assets Drive / Additional Notes
                  </label>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                    {selectedRequest.additionalNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 24px' }}>
              {isEditor && selectedRequest.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginRight: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setProposalModalRequest(selectedRequest);
                      setSelectedRequest(null);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Send Quote & Proposal
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'accepted')}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--accent-success)' }}
                  >
                    Accept Directly
                  </button>
                  <button
                    type="button"
                    onClick={() => updateRequestStatus(selectedRequest.id, 'declined')}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--accent-danger)' }}
                  >
                    Decline
                  </button>
                </div>
              )}

              {!isEditor && selectedRequest.status === 'quoted' && (
                <div style={{ display: 'flex', gap: 8, marginRight: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => handleAcceptProposal(selectedRequest.id)}
                    className="btn btn-primary btn-sm"
                    style={{ background: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}
                  >
                    Accept Proposal
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeclineProposal(selectedRequest.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--accent-danger)' }}
                  >
                    Decline Quote
                  </button>
                </div>
              )}

              {(selectedRequest.status === 'accepted' || selectedRequest.status === 'in_progress' || selectedRequest.status === 'completed') && (
                <Link
                  to={`/dashboard/workspace/${selectedRequest.id}`}
                  onClick={() => setSelectedRequest(null)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  <Video size={14} />
                  <span>Open Collaboration Workspace</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
