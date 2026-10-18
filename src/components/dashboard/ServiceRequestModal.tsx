import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ServiceCategory } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { useClientData } from '../../context/ClientDataContext';
import { Sparkles, Loader2 } from 'lucide-react';

interface ServiceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: ServiceCategory;
  onSuccess: (message: string) => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'video_editing',
  onSuccess,
}) => {
  const { t } = useLanguage();
  const { createServiceRequest } = useClientData();

  const [category, setCategory] = useState<ServiceCategory>(initialCategory);
  const [projectTitle, setProjectTitle] = useState('');
  const [urgency, setUrgency] = useState<'standard' | 'express' | 'rush'>('standard');
  const [budgetRange, setBudgetRange] = useState('');
  const [assetsUrl, setAssetsUrl] = useState('');
  const [targetFormat, setTargetFormat] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { title?: string; description?: string } = {};

    if (!projectTitle.trim()) {
      newErrors.title = 'Project title is required.';
    }
    if (!description.trim()) {
      newErrors.description = 'Please provide creative instructions or project brief.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await createServiceRequest({
        serviceCategory: category,
        projectTitle: projectTitle.trim(),
        description: description.trim(),
        urgency,
        budgetRange: budgetRange.trim() || undefined,
        assetsUrl: assetsUrl.trim() || undefined,
        targetFormat: targetFormat.trim() || undefined,
      });

      // Reset form
      setProjectTitle('');
      setDescription('');
      setAssetsUrl('');
      setBudgetRange('');
      setTargetFormat('');
      onSuccess(t.services.successMessage);
      onClose();
    } catch (err: any) {
      setErrors({ description: err.message || 'Failed to submit request.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.services.requestModalTitle} maxWidth="640px">
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="req-title" className="form-label">{t.services.formProjectTitle} *</label>
            <input
              id="req-title"
              type="text"
              className="form-control"
              placeholder={t.services.formProjectTitlePlaceholder}
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              disabled={submitting}
            />
            {errors.title && <span className="form-error-msg">{errors.title}</span>}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            <div className="form-group">
              <label htmlFor="req-category" className="form-label">{t.services.formCategory}</label>
              <select
                id="req-category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                disabled={submitting}
              >
                <option value="video_editing">{t.categories.video_editing}</option>
                <option value="image_editing">{t.categories.image_editing}</option>
                <option value="audio_editing">{t.categories.audio_editing}</option>
                <option value="esports_gaming">{t.categories.esports_gaming}</option>
                <option value="graphic_design">{t.categories.graphic_design}</option>
                <option value="motion_graphics">{t.categories.motion_graphics}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="req-urgency" className="form-label">{t.services.formUrgency}</label>
              <select
                id="req-urgency"
                className="form-control"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                disabled={submitting}
              >
                <option value="standard">{t.services.urgencyStandard}</option>
                <option value="express">{t.services.urgencyExpress}</option>
                <option value="rush">{t.services.urgencyRush}</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 16,
            }}
          >
            <div className="form-group">
              <label htmlFor="req-assets" className="form-label">{t.services.formAssetsUrl}</label>
              <input
                id="req-assets"
                type="url"
                className="form-control"
                placeholder={t.services.formAssetsPlaceholder}
                value={assetsUrl}
                onChange={(e) => setAssetsUrl(e.target.value)}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="req-format" className="form-label">{t.services.formTargetFormat}</label>
              <input
                id="req-format"
                type="text"
                className="form-control"
                placeholder={t.services.formFormatPlaceholder}
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="req-desc" className="form-label">{t.services.formDescription} *</label>
            <textarea
              id="req-desc"
              className="form-control"
              rows={4}
              placeholder={t.services.formDescriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
            {errors.description && <span className="form-error-msg">{errors.description}</span>}
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={submitting}
          >
            {t.common.cancel}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2
                  size={16}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
                <span>{t.services.submitting}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{t.services.submitRequest}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
