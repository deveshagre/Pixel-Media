import React, { useState } from 'react';
import { PORTFOLIO_ITEMS } from '../../data/portfolioData';
import { PortfolioItem } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { Modal } from '../common/Modal';
import { CheckCircle2, Info } from 'lucide-react';

export const PortfolioSection: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);

  const categories = [
    { id: 'all', label: t.categories.all },
    { id: 'video_editing', label: t.categories.video_editing },
    { id: 'image_editing', label: t.categories.image_editing },
    { id: 'audio_editing', label: t.categories.audio_editing },
    { id: 'esports_gaming', label: t.categories.esports_gaming },
    { id: 'graphic_design', label: t.categories.graphic_design },
    { id: 'motion_graphics', label: t.categories.motion_graphics },
  ];

  const filteredItems =
    selectedCategory === 'all'
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="text-title-1" style={{ marginBottom: 6 }}>
          {t.portfolio.title}
        </h2>
        <p className="text-body" style={{ marginBottom: 12 }}>
          {t.portfolio.subtitle}
        </p>

        {/* Demo Content Identification Notice */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            fontSize: 12.5,
            color: '#7dd3fc',
          }}
        >
          <Info size={14} />
          <span>{t.portfolio.demoNote}</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="filter-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`filter-tab ${selectedCategory === cat.id ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Portfolio Grid */}
      <div className="portfolio-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="portfolio-card card-interactive"
            onClick={() => setActiveItem(item)}
            style={{ cursor: 'pointer' }}
          >
            <div className="portfolio-thumb-wrap">
              <img src={item.thumbnail} alt={item.title} className="portfolio-thumb" />
              <div className="portfolio-badge-overlay">{item.demoType}</div>
            </div>

            <div className="portfolio-content">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: '#818cf8',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t.categories[item.category] || item.categoryLabel}
                </span>
                <span className="text-caption">{item.year}</span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, lineHeight: 1.3 }}>
                {item.title}
              </h3>

              <p
                className="text-body"
                style={{
                  fontSize: 13,
                  lineHeight: 1.45,
                  marginBottom: 16,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {item.description}
              </p>

              <div
                style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: 12,
                  borderTop: '1px solid var(--border-subtle)',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {item.clientName}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--primary)',
                  }}
                >
                  {t.portfolio.viewProject} →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {activeItem && (
        <Modal
          isOpen={Boolean(activeItem)}
          onClose={() => setActiveItem(null)}
          title={activeItem.title}
          maxWidth="700px"
        >
          <div className="modal-body">
            <div
              style={{
                width: '100%',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: 20,
                maxHeight: 320,
              }}
            >
              <img
                src={activeItem.thumbnail}
                alt={activeItem.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16,
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                marginBottom: 20,
              }}
            >
              <div>
                <div className="text-caption">{t.portfolio.client}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>
                  {activeItem.clientName}
                </div>
              </div>
              <div>
                <div className="text-caption">{t.portfolio.scope}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>
                  {activeItem.durationOrScope}
                </div>
              </div>
              <div>
                <div className="text-caption">{t.portfolio.year}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>
                  {activeItem.year}
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Creative Overview & Technical Execution
            </h4>
            <p className="text-body" style={{ marginBottom: 20, lineHeight: 1.6 }}>
              {activeItem.description}
            </p>

            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
              Included Deliverables & Master Exports
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 8,
                marginBottom: 20,
              }}
            >
              {activeItem.deliverables.map((deliv, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <CheckCircle2 size={15} color="var(--accent-success)" />
                  <span>{deliv}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {activeItem.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: 11,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="modal-footer">
            <button
              onClick={() => setActiveItem(null)}
              className="btn btn-secondary"
            >
              {t.portfolio.closeModal}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
