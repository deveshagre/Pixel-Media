import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useClientData } from '../../context/ClientDataContext';
import { ServiceCategory } from '../../types';
import { SERVICES_CATALOG } from '../../data/portfolioData';

interface StudioInquiryProps {
  selectedCategory?: ServiceCategory;
}

export const StudioInquiry: React.FC<StudioInquiryProps> = ({
  selectedCategory = 'video_editing',
}) => {
  const { createServiceRequest } = useClientData();

  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>(selectedCategory);
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'standard' | 'express' | 'rush'>('standard');
  const [budgetRange, setBudgetRange] = useState('$800 - $2,500');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Sync category prop if updated
  React.useEffect(() => {
    if (selectedCategory) {
      setServiceCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await createServiceRequest({
        serviceCategory,
        projectTitle,
        description: description || 'Creative project inquiry submitted from studio homepage.',
        urgency,
        budgetRange,
      });
      setIsSuccess(true);
    } catch (err) {
      console.error('Failed to submit inquiry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="studio-section" aria-label="Project Inquiry">
      <div className="studio-container">
        <div className="inquiry-editorial-card">
          <div style={{ maxWidth: 640 }}>
            <span className="editorial-label">Collaboration</span>
            <h2 className="editorial-headline" style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
              Let's create something memorable.
            </h2>
            <p className="editorial-subhead" style={{ fontSize: 16 }}>
              Share your project scope, timeline, and creative vision. We review every inquiry personally and respond within one business day.
            </p>
          </div>

          {isSuccess ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <CheckCircle2 size={40} color="#ffffff" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 22, fontWeight: 600, color: '#ffffff', marginBottom: 8 }}>
                Inquiry Received
              </h3>
              <p style={{ color: '#a1a1aa', maxWidth: 460, margin: '0 auto 24px', fontSize: 15 }}>
                Thank you for reaching out. We have logged your request into our production review queue.
              </p>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setProjectTitle('');
                  setDescription('');
                }}
                className="studio-btn-subtle"
                style={{ color: '#ffffff' }}
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="inquiry-form-grid">
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>
                  Project Name or Campaign *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autumn Commercial Anthem"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="inquiry-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>
                  Creative Discipline
                </label>
                <select
                  value={serviceCategory}
                  onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                  className="inquiry-select"
                >
                  {SERVICES_CATALOG.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>
                  Desired Timeline
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="inquiry-select"
                >
                  <option value="standard">Standard (3–5 Business Days)</option>
                  <option value="express">Express (48 Hours)</option>
                  <option value="rush">Rush (24 Hours Priority)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>
                  Estimated Budget
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="inquiry-select"
                >
                  <option value="$300 - $800">$300 – $800</option>
                  <option value="$800 - $2,500">$800 – $2,500</option>
                  <option value="$2,500 - $5,000">$2,500 – $5,000</option>
                  <option value="$5,000+">$5,000+ (Full Campaign)</option>
                </select>
              </div>

              <div className="form-full-width">
                <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>
                  Project Brief & Notes
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about the narrative tone, raw footage formats, target deliverables, or references..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="inquiry-textarea"
                />
              </div>

              <div className="form-full-width" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button
                  type="submit"
                  disabled={isSubmitting || !projectTitle.trim()}
                  className="studio-btn-primary"
                  style={{ padding: '12px 28px', fontSize: 15 }}
                >
                  <span>{isSubmitting ? 'Sending...' : 'Send inquiry'}</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
