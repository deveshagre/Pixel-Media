import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { SERVICES_CATALOG } from '../../data/portfolioData';
import { ServiceDetail, ServiceCategory } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { Modal } from '../common/Modal';
import {
  Film,
  Image,
  Headphones,
  Gamepad2,
  Palette,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface OutletContextType {
  openRequestModal: (category?: ServiceCategory) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ServicesSection: React.FC = () => {
  const { t } = useLanguage();
  const { openRequestModal } = useOutletContext<OutletContextType>();
  const [activeService, setActiveService] = useState<ServiceDetail | null>(null);

  const getServiceIcon = (id: ServiceCategory) => {
    switch (id) {
      case 'video_editing':
        return Film;
      case 'image_editing':
        return Image;
      case 'audio_editing':
        return Headphones;
      case 'esports_gaming':
        return Gamepad2;
      case 'graphic_design':
        return Palette;
      case 'motion_graphics':
        return Sparkles;
      default:
        return Film;
    }
  };

  const handleRequestService = (catId: ServiceCategory) => {
    setActiveService(null);
    openRequestModal(catId);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 className="text-title-1" style={{ marginBottom: 6 }}>
          {t.services.title}
        </h2>
        <p className="text-body">{t.services.subtitle}</p>
      </div>

      {/* Services Grid (All 6 Categories) */}
      <div className="services-grid">
        {SERVICES_CATALOG.map((service) => {
          const Icon = getServiceIcon(service.id);
          const categoryTitle = t.categories[service.id] || service.title;

          return (
            <div key={service.id} className="service-card">
              <div>
                <div className="service-icon-box">
                  <Icon size={24} />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                  }}
                >
                  <h3 style={{ fontSize: 18, fontWeight: 600 }}>{categoryTitle}</h3>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#818cf8',
                      backgroundColor: 'var(--primary-subtle)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    From {service.startingPrice}
                  </span>
                </div>

                <p
                  className="text-body"
                  style={{ fontSize: 13.5, lineHeight: 1.5, marginBottom: 16 }}
                >
                  {service.tagline}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    marginBottom: 20,
                  }}
                >
                  <Clock size={14} />
                  <span>
                    {t.services.turnaround}: {service.turnaround}
                  </span>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t.services.deliverablesTitle}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {service.deliverables.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 12.5,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <CheckCircle2 size={14} color="var(--accent-success)" />
                        <span
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  paddingTop: 16,
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <button
                  onClick={() => setActiveService(service)}
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  {t.common.details}
                </button>
                <button
                  onClick={() => handleRequestService(service.id)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1.2 }}
                >
                  <span>{t.services.requestThisService}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Detail Modal */}
      {activeService && (
        <Modal
          isOpen={Boolean(activeService)}
          onClose={() => setActiveService(null)}
          title={t.categories[activeService.id] || activeService.title}
          maxWidth="700px"
        >
          <div className="modal-body">
            <p className="text-body" style={{ fontSize: 14.5, lineHeight: 1.6, marginBottom: 20 }}>
              {activeService.description}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                marginBottom: 24,
              }}
            >
              <div>
                <span className="text-caption">{t.services.turnaround}</span>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>
                  {activeService.turnaround}
                </div>
              </div>
              <div>
                <span className="text-caption">Starting Investment</span>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2, color: '#a5b4fc' }}>
                  {activeService.startingPrice} per project
                </div>
              </div>
            </div>

            {/* Deliverables List */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                {t.services.deliverablesTitle}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeService.deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <CheckCircle2 size={16} color="var(--accent-success)" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Progression */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                {t.services.workflowTitle}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeService.workflow.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-subtle)',
                        color: '#818cf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Formats */}
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                {t.services.formatsTitle}
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {activeService.supportedFormats.map((fmt, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: 12,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              onClick={() => setActiveService(null)}
              className="btn btn-secondary"
            >
              {t.common.close}
            </button>
            <button
              onClick={() => handleRequestService(activeService.id)}
              className="btn btn-primary"
            >
              <span>{t.services.requestThisService}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
