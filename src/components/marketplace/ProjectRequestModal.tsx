import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Plus, Trash2, Calendar, DollarSign, FileText, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCategories, useProjectRequests } from '../../hooks/useMarketplace';
import { UserProfile, EditorCard } from '../../types';
import { useNavigate } from 'react-router-dom';

interface ProjectRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEditor: UserProfile | EditorCard | null;
  prefilledCategory?: string;
}

export const ProjectRequestModal: React.FC<ProjectRequestModalProps> = ({
  isOpen,
  onClose,
  targetEditor,
  prefilledCategory,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { flatCategories } = useCategories();
  const { submitRequest } = useProjectRequests();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(prefilledCategory || '');
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState('Master 4K/UHD Export, Social 9:16 vertical cuts');
  const [deadline, setDeadline] = useState('');
  const [budgetMin, setBudgetMin] = useState<number | ''>(targetEditor?.startingPrice || 250);
  const [budgetMax, setBudgetMax] = useState<number | ''>((targetEditor?.startingPrice ? targetEditor.startingPrice * 2 : 500));
  const [requestQuote, setRequestQuote] = useState(false);
  const [referenceLinks, setReferenceLinks] = useState<string[]>(['']);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !targetEditor) return null;

  const handleAddLink = () => {
    setReferenceLinks([...referenceLinks, '']);
  };

  const handleUpdateLink = (index: number, val: string) => {
    const updated = [...referenceLinks];
    updated[index] = val;
    setReferenceLinks(updated);
  };

  const handleRemoveLink = (index: number) => {
    setReferenceLinks(referenceLinks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in or create an account to hire an editor.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Please provide a project title and detailed brief description.');
      return;
    }

    setSubmitting(true);
    try {
      const cleanLinks = referenceLinks.map((l) => l.trim()).filter(Boolean);
      await submitRequest({
        editorId: targetEditor.id,
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryId || undefined,
        deliverables: deliverables.trim(),
        referenceLinks: cleanLinks,
        budgetMin: requestQuote || budgetMin === '' ? undefined : Number(budgetMin),
        budgetMax: requestQuote || budgetMax === '' ? undefined : Number(budgetMax),
        requestQuote,
        deadline: deadline || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
      });

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              Hire {targetEditor.fullName}
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              Send a structured brief and request a milestone quote
            </p>
          </div>
          <button
            onClick={onClose}
            className="mobile-menu-btn"
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        {success ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--accent-success)',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              Project Brief Dispatched!
            </h4>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 24px' }}>
              Your project brief has been sent to <strong>{targetEditor.fullName}</strong>. They will review your scope, timeline, and deliverables and respond directly.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/dashboard/overview');
                }}
                className="btn btn-primary"
              >
                Track in Dashboard
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Target Editor Summary Snippet */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  {targetEditor.avatarUrl ? (
                    <img src={targetEditor.avatarUrl} alt={targetEditor.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                      {targetEditor.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {targetEditor.fullName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {targetEditor.headline || 'Verified Creative Professional'}
                  </div>
                </div>
                {targetEditor.startingPrice ? (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>From</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-success)' }}>
                      ${targetEditor.startingPrice}
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: '#818cf8', fontWeight: 500 }}>Custom Quote</span>
                )}
              </div>

              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-danger-subtle)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    fontSize: 13,
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Title & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label htmlFor="hire-brief-title" className="form-label">Project Title *</label>
                  <input
                    id="hire-brief-title"
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. 60s Brand Anthem Commercial Cut"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hire-brief-category" className="form-label">Discipline / Service</label>
                  <select
                    id="hire-brief-category"
                    className="form-control"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    <option value="">Select Category...</option>
                    {flatCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Detailed Brief Description */}
              <div className="form-group">
                <label htmlFor="hire-brief-description" className="form-label">
                  Project Brief & Creative Direction *
                </label>
                <textarea
                  id="hire-brief-description"
                  required
                  rows={4}
                  className="form-control"
                  placeholder="Describe your story, vision, target audience, style references, pacing, and color palette preferences..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Deliverables */}
              <div className="form-group">
                <label className="form-label">Required Deliverables</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Master 4K ProRes 422, 3x 9:16 Shorts cuts, Clean dialogue stems"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                />
              </div>

              {/* Timeline & Budget Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Calendar size={14} />
                    <span>Target Delivery Date</span>
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <DollarSign size={14} />
                      <span>Budget (USD)</span>
                    </label>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={requestQuote}
                        onChange={(e) => setRequestQuote(e.target.checked)}
                      />
                      <span>Ask for Quote</span>
                    </label>
                  </div>
                  {!requestQuote ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Min ($)"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : '')}
                      />
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Max ($)"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : '')}
                      />
                    </div>
                  ) : (
                    <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', fontSize: 13, color: '#818cf8', border: '1px solid var(--border-subtle)' }}>
                      Requesting editor's customized estimate based on brief
                    </div>
                  )}
                </div>
              </div>

              {/* Reference Links */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <LinkIcon size={14} />
                    <span>Inspiration & Reference Links</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLink}
                    style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={14} />
                    <span>Add Link</span>
                  </button>
                </div>
                {referenceLinks.map((link, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://youtube.com/watch?v=... or Vimeo / Pinterest"
                      value={link}
                      onChange={(e) => handleUpdateLink(idx, e.target.value)}
                    />
                    {referenceLinks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLink(idx)}
                        style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '0 10px', color: 'var(--accent-danger)', cursor: 'pointer' }}
                        aria-label="Remove link"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Additional Notes / Footage Links */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={14} />
                  <span>Footage / Assets Drive Link & Additional Notes</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Google Drive, Dropbox, Frame.io link, or format requirements"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Send size={15} />
                <span>{submitting ? 'Dispatching Brief...' : 'Send Brief & Request Quote'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
