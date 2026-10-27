import React, { useState } from 'react';
import { X, UploadCloud, AlertCircle, Video, CheckCircle2 } from 'lucide-react';
import { getVideoEmbedInfo } from '../../hooks/useProjectCollaboration';

interface NewReviewVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextVersionNumber: number;
  onSubmitVersion: (data: { title: string; videoUrl: string; notes?: string }) => Promise<unknown>;
  onSuccess?: () => void;
}

export const NewReviewVersionModal: React.FC<NewReviewVersionModalProps> = ({
  isOpen,
  onClose,
  nextVersionNumber,
  onSubmitVersion,
  onSuccess,
}) => {
  const [title, setTitle] = useState(`Version ${nextVersionNumber} — Review Cut`);
  const [videoUrl, setVideoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const embedInfo = videoUrl.trim() ? getVideoEmbedInfo(videoUrl) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedUrl = videoUrl.trim();

    if (!trimmedTitle) {
      setError('Please provide a version title.');
      return;
    }

    if (!trimmedUrl) {
      setError('Please provide a video review or cloud drive URL.');
      return;
    }

    // Basic URL format validation
    try {
      new URL(trimmedUrl);
    } catch {
      setError('Please enter a valid URL (must start with https:// or http://).');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitVersion({
        title: trimmedTitle,
        videoUrl: trimmedUrl,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit review version.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="upload-cut-title">
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560 }}
      >
        <div className="modal-header">
          <div>
            <div className="section-kicker" style={{ marginBottom: 4 }}>CREATIVE REVIEW WORKFLOW</div>
            <h3 id="upload-cut-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              Submit Version {nextVersionNumber} Review Cut
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mobile-menu-btn"
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <CheckCircle2 size={44} style={{ color: 'var(--accent-success)', margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
              Review Cut Published
            </h4>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              The client can now inspect this cut and leave timecoded feedback.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ gap: 16 }}>
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--accent-danger)',
                    fontSize: 13,
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Version Title */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="cut-version-title" className="text-caption" style={{ display: 'block', marginBottom: 6 }}>
                  Version Title *
                </label>
                <input
                  id="cut-version-title"
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Version 1 — First Assembly Cut"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Video URL */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="cut-video-url" className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Video size={13} />
                  <span>Video or Cloud Review URL *</span>
                </label>
                <input
                  id="cut-video-url"
                  type="url"
                  required
                  className="form-control"
                  placeholder="https://vimeo.com/... or https://frame.io/... or https://drive.google.com/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                {embedInfo && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: embedInfo.isEmbeddable ? 'var(--accent-success)' : 'var(--text-secondary)',
                    }}
                  >
                    <span>Provider detected: <strong>{embedInfo.label}</strong></span>
                    {embedInfo.isEmbeddable ? (
                      <span style={{ color: 'var(--text-muted)' }}>• Embedded in-workspace player enabled</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>• Cloud review link hub</span>
                    )}
                  </div>
                )}
              </div>

              {/* Version Notes */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="cut-version-notes" className="text-caption" style={{ display: 'block', marginBottom: 6 }}>
                  Cut Notes & Changelog (Optional)
                </label>
                <textarea
                  id="cut-version-notes"
                  rows={3}
                  className="form-control"
                  placeholder="Summarize what was trimmed, color adjustments made, music cues placed, or what feedback was implemented from earlier notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-subtle)', padding: '16px 24px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <UploadCloud size={14} />
                <span>{submitting ? 'Publishing...' : 'Publish Cut for Client Review'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
