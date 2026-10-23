import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Globe,
  CheckCircle2,
  ArrowUpRight,
  Wrench,
  Sparkles,
  Flag,
} from 'lucide-react';
import { MarketplaceNavbar } from '../components/marketplace/MarketplaceNavbar';
import { ProjectRequestModal } from '../components/marketplace/ProjectRequestModal';
import { PortfolioDetailModal } from '../components/marketplace/PortfolioDetailModal';
import { ReportModal } from '../components/marketplace/ReportModal';
import { useEditorProfile } from '../hooks/useMarketplace';
import { PortfolioItem } from '../types';

export const EditorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { editor, services, software, portfolio, loading } = useEditorProfile(id);

  const [activeTab, setActiveTab] = useState<'portfolio' | 'services' | 'about'>('portfolio');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [activePortfolioItem, setActivePortfolioItem] = useState<PortfolioItem | null>(null);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
        <MarketplaceNavbar />
        <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading editor profile...
        </div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
        <MarketplaceNavbar />
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Editor Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            The requested creator profile does not exist or has been made private.
          </p>
          <Link to="/explore" className="btn btn-primary">
            Explore All Editors
          </Link>
        </div>
      </div>
    );
  }

  const filteredPortfolio =
    selectedCategoryFilter === 'all'
      ? portfolio
      : portfolio.filter((item) => {
          if (typeof item.category === 'object' && item.category !== null) {
            return item.category.slug === selectedCategoryFilter || item.category.id === selectedCategoryFilter;
          }
          return item.categoryId === selectedCategoryFilter || item.category === selectedCategoryFilter;
        });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <MarketplaceNavbar />

      {/* Editor Profile Hero Banner */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          {/* Main Identity & Bio */}
          <div className="profile-main-meta">
            {editor.avatarUrl ? (
              <img src={editor.avatarUrl} alt={editor.fullName} className="profile-avatar-lg" />
            ) : (
              <div
                className="profile-avatar-lg"
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                  fontWeight: 700,
                }}
              >
                {editor.fullName.charAt(0)}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: clampTitle(editor.fullName), fontWeight: 800, letterSpacing: '-0.02em' }}>
                  {editor.fullName}
                </h1>
                {editor.experienceLevel === 'pro' && (
                  <span className="badge-pro">PRO VERIFIED</span>
                )}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-full)',
                    background: editor.availability === 'available' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: editor.availability === 'available' ? '#34d399' : '#fbbf24',
                    border: editor.availability === 'available' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                    textTransform: 'capitalize',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: editor.availability === 'available' ? '#10b981' : '#f59e0b',
                    }}
                  />
                  <span>{editor.availability === 'available' ? 'Available for Hire' : editor.availability}</span>
                </span>
              </div>

              <p style={{ fontSize: 16, color: '#e2e8f0', fontWeight: 500, marginBottom: 12, lineHeight: 1.4 }}>
                {editor.headline}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-muted)' }}>
                {editor.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={14} />
                    <span>{editor.location}</span>
                  </div>
                )}
                {editor.websiteUrl && (
                  <a
                    href={editor.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#818cf8' }}
                  >
                    <Globe size={14} />
                    <span>Portfolio Website</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setShowReportModal(true)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Flag size={12} />
                  <span>Report profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Rate & Hire Action Card */}
          <div className="profile-rate-card">
            <div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Starting Investment
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                {editor.startingPrice ? (
                  <>
                    <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--text-primary)' }}>
                      ${editor.startingPrice}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>/ project</span>
                  </>
                ) : (
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#818cf8' }}>
                    Quote on Scope
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHireModal(true)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15 }}
            >
              <span>Send Project Brief</span>
              <ArrowUpRight size={18} />
            </button>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
              Direct collaboration & milestone escrow protection
            </div>
          </div>
        </div>
      </section>

      {/* Profile Navigation Tabs */}
      <div className="profile-nav-tabs">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`profile-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
        >
          Portfolio ({portfolio.length})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`profile-tab-btn ${activeTab === 'services' ? 'active' : ''}`}
        >
          Services & Software
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`profile-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
        >
          About & Bio
        </button>
      </div>

      {/* Main Tab Content */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px 80px' }}>
        {activeTab === 'portfolio' && (
          <div>
            {/* Filter pills if multiple items */}
            {services.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter('all')}
                  className={`filter-chip ${selectedCategoryFilter === 'all' ? 'active' : ''}`}
                >
                  All Works ({portfolio.length})
                </button>
                {services.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(svc.slug || svc.id)}
                    className={`filter-chip ${selectedCategoryFilter === (svc.slug || svc.id) ? 'active' : ''}`}
                  >
                    {svc.name}
                  </button>
                ))}
              </div>
            )}

            {filteredPortfolio.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                No portfolio items available in this discipline.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                {filteredPortfolio.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActivePortfolioItem(item)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 14,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'transform var(--transition-normal), border-color var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <div style={{ aspectRatio: '16 / 9', position: 'relative', background: '#000', overflow: 'hidden' }}>
                      <img
                        src={item.thumbnailUrl || item.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80'}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {item.editorRole && (
                        <div className="preview-badge-overlay">{item.editorRole}</div>
                      )}
                    </div>

                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: '#818cf8', textTransform: 'uppercase', marginBottom: 4 }}>
                        {item.projectDuration || 'Commercial Master'}
                      </div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {item.title}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 12 }}>
                        {item.description}
                      </p>

                      {item.softwareUsed && item.softwareUsed.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {item.softwareUsed.slice(0, 3).map((sw, i) => (
                            <span key={i} className="software-tag" style={{ fontSize: 10.5 }}>
                              {sw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'services' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Services Offered */}
            <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Sparkles size={18} color="var(--primary)" />
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>Disciplines & Services</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <CheckCircle2 size={16} color="var(--accent-success)" />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{svc.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Software Proficiency */}
            <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Wrench size={18} color="var(--primary)" />
                <h3 style={{ fontSize: 17, fontWeight: 700 }}>Software & Production Stack</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {software.map((sw, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {sw}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div style={{ maxWidth: 800, background: 'var(--bg-surface)', padding: 32, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Creator Biography</h3>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
              {editor.bio || 'This editor has not added a detailed biography yet.'}
            </p>
          </div>
        )}
      </main>

      {/* Hire Modal */}
      {showHireModal && (
        <ProjectRequestModal
          isOpen={showHireModal}
          onClose={() => setShowHireModal(false)}
          targetEditor={editor}
        />
      )}

      {/* Lightbox / Portfolio Item Modal */}
      {activePortfolioItem && (
        <PortfolioDetailModal
          item={activePortfolioItem}
          editor={editor}
          onClose={() => setActivePortfolioItem(null)}
          onHireForSimilar={() => {
            setActivePortfolioItem(null);
            setShowHireModal(true);
          }}
        />
      )}

      {/* Moderation Report Modal */}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          targetType="profile"
          targetId={editor.id}
          targetTitle={editor.fullName}
        />
      )}
    </div>
  );
};

function clampTitle(name: string): string {
  return name.length > 20 ? '24px' : '30px';
}
