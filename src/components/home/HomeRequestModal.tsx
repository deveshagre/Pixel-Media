import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useClientData } from '../../context/ClientDataContext';
import { ServiceCategory } from '../../types';
import { SERVICES_CATALOG } from '../../data/portfolioData';
import { useNavigate } from 'react-router-dom';

interface HomeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: ServiceCategory;
}

export const HomeRequestModal: React.FC<HomeRequestModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'video_editing',
}) => {
  const { createServiceRequest } = useClientData();
  const navigate = useNavigate();

  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(defaultCategory);
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'standard' | 'express' | 'rush'>('standard');
  const [targetFormat, setTargetFormat] = useState('ProRes 422 / 4K UHD');
  const [budgetRange, setBudgetRange] = useState('$500 - $1,500');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createServiceRequest({
        serviceCategory,
        projectTitle,
        description: description || 'Creative project request submitted from studio homepage.',
        urgency,
        targetFormat,
        budgetRange,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to submit request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setProjectTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div
      className="modal-backdrop-cinematic"
      role="dialog"
      aria-modal="true"
      onClick={handleReset}
    >
      <div
        className="project-modal-container"
        style={{ maxWidth: 640 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #1c2237',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
              Request Creative Production
            </h3>
          </div>

          <button
            onClick={handleReset}
            className="nav-tool-btn"
            aria-label="Close request dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <h4 style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                Production Request Received!
              </h4>
              <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 440, margin: '0 auto 24px' }}>
                Your project specification has been logged into the Pixel Media production pipeline.
                You can track milestones, upload stems, and review deliverables in the client portal.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button onClick={handleReset} className="btn btn-secondary">
                  Close Window
                </button>
                <button
                  onClick={() => {
                    handleReset();
                    navigate('/dashboard/overview');
                  }}
                  className="btn btn-primary"
                >
                  <span>Go to Client Portal</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Discipline Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                    Creative Service Discipline
                  </label>
                  <select
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#121623',
                      border: '1px solid #20263b',
                      color: '#ffffff',
                    }}
                  >
                    {SERVICES_CATALOG.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.title} ({svc.startingPrice})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Title */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autumn Commercial Anthem 60s Cut"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#121623',
                      border: '1px solid #20263b',
                      color: '#ffffff',
                    }}
                  />
                </div>

                {/* Urgency & Delivery Target */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                      Production Urgency
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: '#121623',
                        border: '1px solid #20263b',
                        color: '#ffffff',
                      }}
                    >
                      <option value="standard">Standard (3-5 Days)</option>
                      <option value="express">Express (48 Hours)</option>
                      <option value="rush">Rush (24 Hours)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                      Master Delivery Format
                    </label>
                    <input
                      type="text"
                      value={targetFormat}
                      onChange={(e) => setTargetFormat(e.target.value)}
                      placeholder="e.g. ProRes 422 HQ / 4K"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        background: '#121623',
                        border: '1px solid #20263b',
                        color: '#ffffff',
                      }}
                    />
                  </div>
                </div>

                {/* Estimated Budget Range */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                    Estimated Budget Range
                  </label>
                  <select
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#121623',
                      border: '1px solid #20263b',
                      color: '#ffffff',
                    }}
                  >
                    <option value="$300 - $800">$300 - $800</option>
                    <option value="$800 - $2,500">$800 - $2,500</option>
                    <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                    <option value="$5,000+">$5,000+ (Enterprise Campaign)</option>
                  </select>
                </div>

                {/* Brief & Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
                    Scope Brief & Creative Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on camera RAW format, music cue directions, or target aspect ratios..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      background: '#121623',
                      border: '1px solid #20263b',
                      color: '#ffffff',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Form Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                  <button type="button" onClick={handleReset} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !projectTitle.trim()}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? 'Logging Request...' : 'Submit Creative Request'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
