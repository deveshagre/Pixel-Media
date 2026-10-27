import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Plus, Trash2, Calendar, DollarSign, Layers } from 'lucide-react';
import { ProjectRequest, MilestoneAgreement } from '../../types';

interface ProjectProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ProjectRequest;
  onSubmitProposal: (
    requestId: string,
    proposal: {
      quotedPrice: number;
      estimatedDelivery: string;
      scopeSummary: string;
      revisionsIncluded?: number;
      deliverablesFormat?: string;
      notes?: string;
      milestones?: MilestoneAgreement[];
    }
  ) => Promise<unknown>;
  onSuccess?: () => void;
}

export const ProjectProposalModal: React.FC<ProjectProposalModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmitProposal,
  onSuccess,
}) => {
  const [quotedPrice, setQuotedPrice] = useState<number | ''>(
    request.budgetMin || request.budgetMax || 350
  );
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    request.deadline || ''
  );
  const [scopeSummary, setScopeSummary] = useState('');
  const [revisionsIncluded, setRevisionsIncluded] = useState(2);
  const [deliverablesFormat, setDeliverablesFormat] = useState(
    'ProRes 422 HQ master export + 1080p MP4 web delivery'
  );
  const [notes, setNotes] = useState('');

  // Structured milestones
  const initialPrice = typeof quotedPrice === 'number' ? quotedPrice : 350;
  const halfPrice = Math.round(initialPrice / 2);
  const [milestones, setMilestones] = useState<Array<{ id: string; title: string; amount: number }>>([
    {
      id: 'm1',
      title: 'Milestone 1: Assembly & Rough Cut Review',
      amount: halfPrice,
    },
    {
      id: 'm2',
      title: 'Milestone 2: Color Grade, Sound Mix & Final Master',
      amount: initialPrice - halfPrice,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddMilestone = () => {
    const nextIdx = milestones.length + 1;
    setMilestones([
      ...milestones,
      {
        id: `m-${Date.now()}`,
        title: `Milestone ${nextIdx}: Delivery Stage`,
        amount: 100,
      },
    ]);
  };

  const handleUpdateMilestone = (index: number, field: 'title' | 'amount', value: string | number) => {
    const updated = [...milestones];
    if (field === 'title') {
      updated[index].title = String(value);
    } else {
      updated[index].amount = Math.max(0, Number(value) || 0);
    }
    setMilestones(updated);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const milestonesTotal = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = Number(quotedPrice);
    if (!priceNum || priceNum <= 0) {
      setError('Please provide a valid quoted price greater than $0.');
      return;
    }

    if (!estimatedDelivery) {
      setError('Please specify an estimated completion or delivery date.');
      return;
    }

    if (!scopeSummary.trim() || scopeSummary.trim().length < 10) {
      setError('Please describe your proposed scope and creative approach (minimum 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const formattedMilestones: MilestoneAgreement[] = milestones.map((m, idx) => ({
        id: m.id || `ms-${idx + 1}`,
        title: m.title.trim() || `Milestone ${idx + 1}`,
        amount: Number(m.amount) || 0,
        percentage: priceNum > 0 ? Math.round(((Number(m.amount) || 0) / priceNum) * 100) : 0,
        status: 'pending',
      }));

      await onSubmitProposal(request.id, {
        quotedPrice: priceNum,
        estimatedDelivery,
        scopeSummary: scopeSummary.trim(),
        revisionsIncluded: Number(revisionsIncluded),
        deliverablesFormat: deliverablesFormat.trim(),
        notes: notes.trim() || undefined,
        milestones: formattedMilestones,
      });

      setSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="proposal-title">
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 660, maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="section-kicker" style={{ marginBottom: 4 }}>CREATOR PROPOSAL & FORMAL QUOTE</div>
            <h3 id="proposal-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              Respond to: {request.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mobile-menu-btn"
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close quote modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <CheckCircle2 size={48} style={{ color: 'var(--accent-success)', margin: '0 auto 16px' }} />
            <h4 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
              Proposal Sent Successfully
            </h4>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 24px', lineHeight: 1.6 }}>
              Your formal quote and structured milestones have been dispatched to the client. You will be notified as soon as they review and accept.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary"
              style={{ minWidth: 140 }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ gap: 18 }}>
              {error && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: 'var(--accent-danger)',
                    fontSize: 13.5,
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Client Brief Summary Card */}
              <div
                style={{
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Client's Requested Budget & Scope:</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  {request.requestQuote
                    ? 'Client requested custom creator pricing'
                    : request.budgetMin && request.budgetMax
                    ? `$${request.budgetMin} – $${request.budgetMax} USD`
                    : request.budgetMin
                    ? `From $${request.budgetMin} USD`
                    : 'Flexible / Open'}
                  {request.deadline ? ` • Target: ${request.deadline}` : ''}
                </div>
              </div>

              {/* Price & Turnaround Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="proposal-quoted-price" className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <DollarSign size={13} />
                    <span>Total Quoted Price ($ USD) *</span>
                  </label>
                  <input
                    id="proposal-quoted-price"
                    type="number"
                    min="1"
                    step="1"
                    required
                    className="form-control"
                    placeholder="e.g. 500"
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="proposal-delivery-date" className="text-caption" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Calendar size={13} />
                    <span>Estimated Completion Date *</span>
                  </label>
                  <input
                    id="proposal-delivery-date"
                    type="date"
                    required
                    className="form-control"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                  />
                </div>
              </div>

              {/* Scope & Creative Plan */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="proposal-scope-summary" className="text-caption" style={{ display: 'block', marginBottom: 6 }}>
                  Scope of Work & Creative Approach *
                </label>
                <textarea
                  id="proposal-scope-summary"
                  rows={4}
                  required
                  className="form-control"
                  placeholder="Detail your workflow, narrative pacing, color correction, sound design, and what raw assets you will need from the client..."
                  value={scopeSummary}
                  onChange={(e) => setScopeSummary(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Revisions & Deliverables Format */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="proposal-revisions" className="text-caption" style={{ display: 'block', marginBottom: 6 }}>
                    Revisions Included
                  </label>
                  <select
                    id="proposal-revisions"
                    className="form-control"
                    value={revisionsIncluded}
                    onChange={(e) => setRevisionsIncluded(Number(e.target.value))}
                  >
                    <option value={1}>1 round of revisions</option>
                    <option value={2}>2 rounds of revisions (Recommended)</option>
                    <option value={3}>3 rounds of revisions</option>
                    <option value={5}>5 rounds of revisions</option>
                    <option value={99}>Unlimited creative revisions</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="proposal-deliverables-format" className="text-caption" style={{ display: 'block', marginBottom: 6 }}>
                    Master Deliverables Format
                  </label>
                  <input
                    id="proposal-deliverables-format"
                    type="text"
                    className="form-control"
                    placeholder="e.g. 4K ProRes 422 HQ + Social Cuts"
                    value={deliverablesFormat}
                    onChange={(e) => setDeliverablesFormat(e.target.value)}
                  />
                </div>
              </div>

              {/* Structured Milestones Breakdown */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                      <Layers size={15} />
                      <span>Structured Milestone Agreements</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Transparent payment-ready schedule for progressive review and completion.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddMilestone}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                  >
                    <Plus size={13} />
                    <span>Add Stage</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {milestones.map((ms, index) => (
                    <div
                      key={ms.id || index}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 110px 36px',
                        gap: 8,
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Stage title / Deliverable"
                        value={ms.title}
                        onChange={(e) => handleUpdateMilestone(index, 'title', e.target.value)}
                        style={{ height: 38, fontSize: 13 }}
                      />
                      <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 10, top: 9, color: 'var(--text-muted)', fontSize: 13 }}>$</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="form-control"
                          value={ms.amount}
                          onChange={(e) => handleUpdateMilestone(index, 'amount', e.target.value)}
                          style={{ height: 38, paddingLeft: 24, fontSize: 13 }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMilestone(index)}
                        disabled={milestones.length <= 1}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: milestones.length <= 1 ? 'var(--text-muted)' : 'var(--accent-danger)',
                          cursor: milestones.length <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 38,
                          opacity: milestones.length <= 1 ? 0.4 : 0.8,
                        }}
                        title="Remove stage"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Milestone sum check */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: 12.5,
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    Total Milestones: <strong style={{ color: 'var(--text-primary)' }}>${milestonesTotal}</strong>
                  </span>
                  {quotedPrice && milestonesTotal !== Number(quotedPrice) ? (
                    <span style={{ color: '#fbbf24', fontSize: 12 }}>
                      Note: Milestone total (${milestonesTotal}) differs from quote (${quotedPrice})
                    </span>
                  ) : (
                    <span style={{ color: 'var(--accent-success)', fontSize: 12 }}>
                      Milestones match quoted total
                    </span>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="text-caption" style={{ display: 'block', marginBottom: 6 }}>
                  Additional Notes / Asset Handoff Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  className="form-control"
                  placeholder="Specify drive links, preferred cloud storage, timecode requirements, or music licensing..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            {/* Footer */}
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
                <Send size={14} />
                <span>{submitting ? 'Submitting Quote...' : 'Submit Proposal to Client'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
