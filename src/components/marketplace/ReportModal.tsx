import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useReports } from '../../hooks/useMarketplace';
import { ReportTargetType } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
}

const REPORT_REASONS = [
  'Copyright infringement or stolen portfolio work',
  'Misleading profile, credentials, or fake portfolio',
  'Explicit, harmful, or offensive content',
  'Spam, fraudulent solicitation, or scam',
  'Other violation of marketplace terms',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { submitReport } = useReports();
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await submitReport({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 120 }} onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-warning)' }}>
            <AlertTriangle size={18} />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
              Report Content for Review
            </h3>
          </div>
          <button
            onClick={onClose}
            className="mobile-menu-btn"
            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {submitted ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '36px 20px' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <CheckCircle2 size={26} />
            </div>
            <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Report Received</h4>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Thank you for keeping Pixel Pedia safe and honest. Our trust & safety team has queued this item for investigation.
            </p>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {targetTitle && (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Reporting: <strong style={{ color: 'var(--text-primary)' }}>{targetTitle}</strong>
                </div>
              )}

              {error && (
                <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--accent-danger-subtle)', color: '#fca5a5', fontSize: 12.5 }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Reason for reporting *</label>
                <select
                  className="form-control"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {REPORT_REASONS.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Specific Details or Evidence</label>
                <textarea
                  rows={3}
                  className="form-control"
                  placeholder="Provide timestamps, links to original artist proof, or explanation..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
