import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Globe,
  User,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { SupportedLanguage, PortfolioItem, EditorCard } from '../types';
import { DEMO_EDITORS, DEMO_PORTFOLIO_ITEMS, DEMO_EDITOR_SOFTWARE } from '../data/demoEditors';
import { PortfolioDetailModal } from '../components/marketplace/PortfolioDetailModal';
import { ProjectRequestModal } from '../components/marketplace/ProjectRequestModal';

export const HomePage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  const [activePortfolioItem, setActivePortfolioItem] = useState<{
    item: PortfolioItem;
    editor: EditorCard;
  } | null>(null);
  const [hireTargetEditor, setHireTargetEditor] = useState<EditorCard | null>(null);

  const handleToggleRole = async () => {
    if (!user) return;
    const nextRole = user.role === 'client' ? 'editor' : 'client';
    await switchRole(nextRole);
  };

  // Convert top 3 demo editors for showcase attribution
  const featuredEditors: EditorCard[] = DEMO_EDITORS.slice(0, 3).map((ed) => {
    const portfolio = DEMO_PORTFOLIO_ITEMS.filter((p) => p.editorId === ed.id);
    return {
      id: ed.id,
      fullName: ed.fullName,
      headline: ed.headline,
      avatarUrl: ed.avatarUrl,
      experienceLevel: ed.experienceLevel,
      availability: ed.availability,
      startingPrice: ed.startingPrice,
      contactForQuote: ed.contactForQuote,
      location: ed.location,
      services: [],
      software: DEMO_EDITOR_SOFTWARE[ed.id] || [],
      portfolioPreview: portfolio.slice(0, 3),
      portfolioCount: portfolio.length,
    };
  });

  // 3 Curated showcase pieces from verified demo items
  const showcaseItems = [
    {
      item: DEMO_PORTFOLIO_ITEMS[0], // Apex Horizon — Commercial Master
      editor: featuredEditors[0] || DEMO_EDITORS[0],
      tag: 'COMMERCIAL MASTER',
    },
    {
      item: DEMO_PORTFOLIO_ITEMS[1], // Cybernetic Identity — 3D Motion
      editor: featuredEditors[1] || DEMO_EDITORS[1],
      tag: '3D MOTION & VFX',
    },
    {
      item: DEMO_PORTFOLIO_ITEMS[2], // Neon Tokyo — DaVinci Color Grade
      editor: featuredEditors[2] || DEMO_EDITORS[2],
      tag: 'DAVINCI COLOR GRADE',
    },
  ].filter((s) => Boolean(s.item));

  // Determine intelligent destinations for the role selection cards
  const clientDestination = user
    ? user.role === 'client'
      ? '/explore'
      : '/dashboard/overview'
    : '/signup?role=client';

  const editorDestination = user
    ? user.role === 'editor'
      ? '/dashboard/requests'
      : '/dashboard/overview'
    : '/signup?role=editor';

  return (
    <div className="pm-home-page">
      {/* 1. Minimal Brand Header */}
      <header className="pm-header">
        <div className="pm-header-inner">
          {/* Logo & Brand Wordmark */}
          <Link to="/" className="pm-brand" aria-label="Pixel Media Home">
            <img src={logoImg} alt="Pixel Media" className="pm-brand-logo" />
            <span>PIXEL MEDIA</span>
          </Link>

          {/* Navigation Links */}
          <nav className="pm-header-nav" aria-label="Main Navigation">
            <Link to="/explore" className="pm-header-link">
              Explore Talent
            </Link>
            <a href="#how-it-works" className="pm-header-link">
              How It Works
            </a>
          </nav>

          {/* Right Actions */}
          <div className="pm-header-actions">
            {/* Language Switcher */}
            <div className="lang-selector" style={{ padding: '3px 8px', fontSize: 12 }}>
              <Globe size={13} />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                aria-label={t.common.language}
                style={{ fontSize: 12 }}
              >
                {supportedLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.code.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Role Mode Toggle */}
                <button
                  type="button"
                  onClick={handleToggleRole}
                  title={`Currently in ${user.role} mode. Click to toggle role.`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 11.5,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 500,
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={11} />
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {user.role} Mode
                  </span>
                </button>

                {/* Dashboard Link */}
                <Link
                  to="/dashboard/overview"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px' }}
                >
                  <User size={14} />
                  <span>Dashboard</span>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Link
                  to="/login"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 14px' }}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px' }}
                >
                  <span>Get Started</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main>
        <section className="pm-hero-section">
          <div className="pm-hero-content">
            {/* Eyebrow */}
            <div className="pm-eyebrow">
              <span className="pm-eyebrow-dot" />
              <span>YOUR NEXT CREATIVE PROJECT STARTS HERE</span>
            </div>

            {/* Main Heading */}
            <h1 className="pm-main-heading">Ideas deserve better visuals.</h1>

            {/* Supporting Text */}
            <p className="pm-supporting-text">
              Find the right creative talent. Or turn your editing skills into your next opportunity.
            </p>
          </div>

          {/* 3. The Two Prominent Interactive Role Choices */}
          <div className="pm-role-grid">
            {/* Client Role Card */}
            <Link
              to={clientDestination}
              className="pm-role-card"
              aria-label="I'm a Client — I need a creative for my project. Hire talent"
            >
              <div className="pm-role-card-header">
                <span className="pm-role-kicker">FOR CLIENTS &amp; STUDIOS</span>
                <h2 className="pm-role-title">I'm a Client</h2>
                <p className="pm-role-desc">I need a creative for my project.</p>
              </div>

              {/* Directorial Framing Abstract Graphic */}
              <div className="pm-role-visual-plate">
                <div className="pm-viewfinder-plate">
                  <div className="pm-viewfinder-graphic">
                    <span className="pm-viewfinder-aspect">[ 2.39:1 CINEMATIC ]</span>
                  </div>
                  <div className="pm-viewfinder-tracks">
                    <div className="pm-viewfinder-track video" />
                    <div className="pm-viewfinder-track audio" />
                  </div>
                  <span className="pm-viewfinder-timecode">00:01:24:18</span>
                </div>
              </div>

              {/* Card Footer / CTA */}
              <div className="pm-role-cta-bar">
                <span className="pm-role-cta-text">
                  <span>Hire talent</span>
                </span>
                <span className="pm-role-cta-arrow" aria-hidden="true">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>

            {/* Editor Role Card */}
            <Link
              to={editorDestination}
              className="pm-role-card"
              aria-label="I'm an Editor — I want to showcase my skills. Find work"
            >
              <div className="pm-role-card-header">
                <span className="pm-role-kicker">FOR EDITORS &amp; CREATORS</span>
                <h2 className="pm-role-title">I'm an Editor</h2>
                <p className="pm-role-desc">I want to showcase my skills.</p>
              </div>

              {/* Audio Stems & Color Nodes Abstract Graphic */}
              <div className="pm-role-visual-plate">
                <div className="pm-editor-plate">
                  <div className="pm-waveform-stack">
                    <div className="pm-waveform-bar" style={{ height: '36%' }} />
                    <div className="pm-waveform-bar" style={{ height: '65%' }} />
                    <div className="pm-waveform-bar accent" style={{ height: '88%' }} />
                    <div className="pm-waveform-bar" style={{ height: '48%' }} />
                    <div className="pm-waveform-bar accent" style={{ height: '94%' }} />
                    <div className="pm-waveform-bar" style={{ height: '70%' }} />
                    <div className="pm-waveform-bar" style={{ height: '52%' }} />
                    <div className="pm-waveform-bar accent" style={{ height: '82%' }} />
                    <div className="pm-waveform-bar" style={{ height: '40%' }} />
                  </div>
                  <div className="pm-waveform-node-badge">
                    <span className="pm-color-node-icon" title="DaVinci Color Node" />
                    <span className="pm-codec-badge">4K PRORES 422 HQ</span>
                  </div>
                </div>
              </div>

              {/* Card Footer / CTA */}
              <div className="pm-role-cta-bar">
                <span className="pm-role-cta-text">
                  <span>Find work</span>
                </span>
                <span className="pm-role-cta-arrow" aria-hidden="true">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* 4. Compact Curated Work Showcase */}
        {showcaseItems.length > 0 && (
          <section className="pm-showcase-section">
            <div className="pm-section-header">
              <div>
                <div className="pm-section-kicker">CURATED SHOWCASE</div>
                <h2 className="pm-section-title">Selected Editorial Works</h2>
              </div>
              <Link
                to="/explore"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <span>Explore All Works</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="pm-showcase-grid">
              {showcaseItems.map(({ item, editor, tag }) => {
                if (!item) return null;
                const thumb =
                  item.thumbnailUrl ||
                  item.thumbnail ||
                  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80';

                return (
                  <div
                    key={item.id}
                    className="pm-showcase-card"
                    tabIndex={0}
                    role="button"
                    onClick={() => setActivePortfolioItem({ item, editor: editor as EditorCard })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActivePortfolioItem({ item, editor: editor as EditorCard });
                      }
                    }}
                    aria-label={`View work: ${item.title} by ${editor?.fullName || 'Creator'}`}
                  >
                    <div className="pm-showcase-thumb-wrap">
                      <img src={thumb} alt={item.title} className="pm-showcase-thumb-img" />
                      <span className="pm-showcase-role-tag">{tag}</span>
                    </div>

                    <div className="pm-showcase-body">
                      <div>
                        <h3 className="pm-showcase-title">{item.title}</h3>
                        <div className="pm-showcase-editor">
                          By {editor?.fullName || 'Featured Editor'}
                        </div>
                      </div>

                      <div className="pm-showcase-footer">
                        <span>{item.projectDuration || '02:14'}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>Click to view details</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. One Concise "How It Works" Section */}
        <section id="how-it-works" className="pm-workflow-section">
          <div className="pm-section-header">
            <div>
              <div className="pm-section-kicker">HOW IT WORKS</div>
              <h2 className="pm-section-title">Direct, transparent creative collaboration</h2>
            </div>
            <Link
              to="/explore"
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Sliders size={13} />
              <span>Browse Catalog</span>
            </Link>
          </div>

          <div className="pm-workflow-grid">
            <div className="pm-workflow-card">
              <div className="pm-workflow-num">01 / DISCOVERY</div>
              <h3 className="pm-workflow-title">Direct Discovery</h3>
              <p className="pm-workflow-desc">
                Find narrative film editors, DaVinci colorists, and 3D motion designers by verified
                showreel, NLE software, and rate card without agency middleman markup.
              </p>
            </div>

            <div className="pm-workflow-card">
              <div className="pm-workflow-num">02 / COLLABORATION</div>
              <h3 className="pm-workflow-title">Creative Collaboration</h3>
              <p className="pm-workflow-desc">
                Align directly with your creative. Review cut versions with frame-accurate timestamped
                feedback and structured project revisions.
              </p>
            </div>

            <div className="pm-workflow-card">
              <div className="pm-workflow-num">03 / DIRECT SETTLEMENT</div>
              <h3 className="pm-workflow-title">Agree Directly</h3>
              <p className="pm-workflow-desc">
                Set milestone timing and compensation directly together. Track deliverables and approvals
                in Pixel Media, with payment arranged between client and creator.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Minimal Footer */}
      <footer className="pm-footer">
        <div className="pm-footer-inner">
          <div className="pm-footer-brand-wrap">
            <Link to="/" className="pm-brand" aria-label="Pixel Media Home">
              <img src={logoImg} alt="Pixel Media" className="pm-brand-logo" />
              <span>PIXEL MEDIA</span>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, marginTop: 4 }}>
              A home for creative talent.
            </p>
          </div>

          <div className="pm-footer-links">
            <Link to="/explore" className="pm-footer-link">
              Explore Talent
            </Link>
            <Link to="/signup?role=client" className="pm-footer-link">
              Client Portal
            </Link>
            <Link to="/signup?role=editor" className="pm-footer-link">
              Editor Workspace
            </Link>
            <Link to="/dashboard/help" className="pm-footer-link">
              Help Center
            </Link>
          </div>
        </div>

        <div className="pm-footer-bottom">
          <div>
            &copy; 2026 Pixel Media. Independent creative marketplace.
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            CURATED CREATIVE PLATFORM
          </div>
        </div>
      </footer>

      {/* Portfolio Item Detail Lightbox Modal */}
      {activePortfolioItem && (
        <PortfolioDetailModal
          item={activePortfolioItem.item}
          editor={activePortfolioItem.editor}
          isOpen={Boolean(activePortfolioItem)}
          onClose={() => setActivePortfolioItem(null)}
          onHireClick={() => {
            const ed = activePortfolioItem.editor;
            setActivePortfolioItem(null);
            setHireTargetEditor(ed);
          }}
        />
      )}

      {/* Project Request Modal */}
      {hireTargetEditor && (
        <ProjectRequestModal
          editor={hireTargetEditor}
          isOpen={Boolean(hireTargetEditor)}
          onClose={() => setHireTargetEditor(null)}
          onSuccess={() => {
            setHireTargetEditor(null);
          }}
        />
      )}
    </div>
  );
};
