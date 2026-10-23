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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjectRequests } from '../../hooks/useMarketplace';
import { ProjectRequest, RequestStatus } from '../../types';

export const MarketplaceRequestsView: React.FC = () => {
  const { user } = useAuth();
  const { requests, loading, updateRequestStatus } = useProjectRequests();
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ProjectRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isEditor = user?.role === 'editor';

  const handleStatusChange = async (requestId: string, newStatus: RequestStatus) => {
    setUpdatingId(requestId);
    try {
      await updateRequestStatus(requestId, newStatus);
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter((r) => r.status === filterStatus);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 className="text-title-1" style={{ marginBottom: 4 }}>
            {isEditor ? 'Incoming Client Requests' : 'My Project Briefs'}
          </h2>
          <p className="text-body">
            {isEditor
              ? 'Review briefs from prospective clients, accept opportunities, and deliver milestones.'
              : 'Track submitted project briefs, responses from editors, and production status.'}
          </p>
        </div>

        {!isEditor && (
          <Link to="/explore" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={15} />
            <span>Find More Editors</span>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 24 }}>
        {(['all', 'pending', 'accepted', 'completed', 'declined'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`filter-tab ${filterStatus === st ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            {st} ({st === 'all' ? requests.length : requests.filter((r) => r.status === st).length})
          </button>
        ))}
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
            {isEditor ? 'No incoming client requests' : 'No project briefs submitted yet'}
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
            {isEditor
              ? 'Once clients discover your portfolio and dispatch a brief, it will show up here.'
              : 'Browse our vetted directory of editors to send your first project brief.'}
          </p>
          {!isEditor && (
            <Link to="/explore" className="btn btn-primary btn-sm">
              Explore Talent
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                gap: 14,
                transition: 'border-color var(--transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span className={`status-badge ${req.status}`}>
                      {req.status}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      Submitted {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {req.title}
                  </h3>
                </div>

                {/* Right metadata / actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(req)}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <FileText size={14} />
                    <span>View Full Brief</span>
                  </button>

                  {/* Actions for Editor */}
                  {isEditor && req.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(req.id, 'accepted')}
                        disabled={updatingId === req.id}
                        className="btn btn-primary btn-sm"
                        style={{ background: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(req.id, 'declined')}
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
                      onClick={() => handleStatusChange(req.id, 'completed')}
                      disabled={updatingId === req.id}
                      className="btn btn-primary btn-sm"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>

              {/* Brief Excerpt */}
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {req.description}
              </p>

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
                    <span>Deadline: <strong style={{ color: 'var(--text-primary)' }}>{req.deadline}</strong></span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DollarSign size={14} />
                  <span>
                    Budget:{' '}
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

      {/* Detailed Full Brief Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 640 }}>
            <div className="modal-header">
              <div>
                <span className={`status-badge ${selectedRequest.status}`} style={{ marginBottom: 6 }}>
                  {selectedRequest.status}
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

            <div className="modal-footer">
              {isEditor && selectedRequest.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginRight: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedRequest.id, 'accepted')}
                    className="btn btn-primary btn-sm"
                    style={{ background: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}
                  >
                    Accept Brief
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(selectedRequest.id, 'declined')}
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--accent-danger)' }}
                  >
                    Decline
                  </button>
                </div>
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
