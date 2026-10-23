import React, { useState } from 'react';
import { X, ExternalLink, Calendar, Briefcase, Flag, ArrowUpRight, Film, Wrench } from 'lucide-react';
import { PortfolioItem, UserProfile, EditorCard } from '../../types';
import { ReportModal } from './ReportModal';

interface PortfolioDetailModalProps {
  item: PortfolioItem | null;
  editor?: UserProfile | EditorCard | null;
  isOpen?: boolean;
  onClose: () => void;
  onHireForSimilar?: (item: PortfolioItem) => void;
  onHireClick?: () => void;
}

export const PortfolioDetailModal: React.FC<PortfolioDetailModalProps> = ({
  item,
  editor,
  onClose,
  onHireForSimilar,
  onHireClick,
}) => {
  const [showReport, setShowReport] = useState(false);

  if (!item) return null;

  const getMediaSource = () => {
    return item.mediaUrl || item.thumbnailUrl || item.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80';
  };

  const isVideo = item.mediaType === 'video' || (item.mediaUrl && item.mediaUrl.endsWith('.mp4'));

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-dialog lightbox-dialog"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 840 }}
        >
          {/* Header */}
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge-pro" style={{ textTransform: 'capitalize' }}>
                {typeof item.category === 'object' && item.category !== null
                  ? item.category.name
                  : (item.categoryLabel || item.category || 'Portfolio')}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {item.editorRole || 'Lead Editor'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => setShowReport(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                }}
                title="Report inappropriate content"
              >
                <Flag size={14} />
                <span>Report</span>
              </button>
              <button
                onClick={onClose}
                className="mobile-menu-btn"
                style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Media Player / Viewer */}
          <div className="lightbox-media-wrap">
            {isVideo ? (
              <video
                src={getMediaSource()}
                controls
                autoPlay
                muted
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <img
                src={getMediaSource()}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}
          </div>

          {/* Content Details */}
          <div className="modal-body" style={{ gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 14.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {item.description || 'No detailed description provided.'}
              </p>
            </div>

            {/* Spec Breakdown Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 12,
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>
                  <Briefcase size={13} />
                  <span>Role / Scope</span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {item.editorRole || item.durationOrScope || 'Lead Video Editor'}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>
                  <Calendar size={13} />
                  <span>Duration / Year</span>
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                  {item.projectDuration || item.year || '2025'}
                </div>
              </div>

              {item.externalLink && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', marginBottom: 3 }}>
                    <Film size={13} />
                    <span>External Showcase</span>
                  </div>
                  <a
                    href={item.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 13, color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>Watch Full Reel</span>
                    <ExternalLink size={13} />
                  </a>
                </div>
              )}
            </div>

            {/* Software Used Tags */}
            {item.softwareUsed && item.softwareUsed.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                  <Wrench size={13} />
                  <span>Software & Production Tools</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {item.softwareUsed.map((sw, idx) => (
                    <span key={idx} className="software-tag">
                      {sw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Close
            </button>
            {(onHireForSimilar || onHireClick) && editor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onHireClick) {
                    onHireClick();
                  } else if (onHireForSimilar && item) {
                    onHireForSimilar(item);
                  }
                }}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>Start a Project Like This</span>
                <ArrowUpRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Moderation Report Modal */}
      {showReport && (
        <ReportModal
          isOpen={showReport}
          onClose={() => setShowReport(false)}
          targetType="portfolio_item"
          targetId={item.id}
          targetTitle={item.title}
        />
      )}
    </>
  );
};
