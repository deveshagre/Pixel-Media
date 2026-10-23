import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clapperboard,
  Search,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Star,
  Film,
  Video,
  Layers,
  ShieldCheck,
  Clock,
  MapPin,
  Compass,
} from 'lucide-react';
import { MarketplaceNavbar } from '../components/marketplace/MarketplaceNavbar';
import { ProjectRequestModal } from '../components/marketplace/ProjectRequestModal';
import { PortfolioDetailModal } from '../components/marketplace/PortfolioDetailModal';
import { useCategories } from '../hooks/useMarketplace';
import { DEMO_EDITORS, DEMO_PORTFOLIO_ITEMS, DEMO_EDITOR_SOFTWARE } from '../data/demoEditors';
import { EditorCard, PortfolioItem } from '../types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [hireTargetEditor, setHireTargetEditor] = useState<EditorCard | null>(null);
  const [activePortfolioItem, setActivePortfolioItem] = useState<{ item: PortfolioItem; editor: EditorCard } | null>(null);
  const [howItWorksRole, setHowItWorksRole] = useState<'client' | 'editor'>('client');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  // Convert top demo editors to EditorCards
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <MarketplaceNavbar />

      {/* Hero Section */}
      <section className="market-hero">
        <div className="market-hero-pill">
          <Sparkles size={14} />
          <span>The Vetted Freelance Marketplace for Post-Production</span>
        </div>

        <h1 className="market-hero-title">
          Find & Hire World-Class <br />
          <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Video Editors & Motion Artists
          </span>
        </h1>

        <p className="market-hero-sub">
          Connect with top-tier narrative film editors, commercial colorists, YouTube specialists, and 3D motion designers. Dispatch structured project briefs with milestone protection.
        </p>

        {/* Live Search Box */}
        <form onSubmit={handleSearchSubmit} className="market-search-box">
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="market-search-input"
            placeholder="Try 'YouTube documentary editor', 'DaVinci colorist', 'After Effects 3D'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: 12, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Search Talent</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Category Discovery Pills */}
        <div className="category-pills-wrap">
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 4 }}>Popular Disciplines:</span>
          <Link to="/explore?category=video-editing" className="category-pill">
            <Film size={13} />
            <span>Commercial & Narrative</span>
          </Link>
          <Link to="/explore?category=motion-graphics" className="category-pill">
            <Sparkles size={13} />
            <span>3D Motion Graphics</span>
          </Link>
          <Link to="/explore?category=color-grading" className="category-pill">
            <Layers size={13} />
            <span>DaVinci Color Grading</span>
          </Link>
          <Link to="/explore?category=audio-post-production" className="category-pill">
            <Compass size={13} />
            <span>Sound Design</span>
          </Link>
          <Link to="/explore?category=gaming-esports" className="category-pill">
            <Video size={13} />
            <span>Esports & Gaming</span>
          </Link>
        </div>

        {/* Trust Badges Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            maxWidth: 960,
            margin: '56px auto 0',
            padding: '20px 24px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 16,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ShieldCheck size={24} color="#818cf8" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>100% Vetted Portfolios</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Original reels & verified credits</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Clock size={24} color="#34d399" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>24-48h Brief Responses</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fast turnaround on inquiries</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Star size={24} color="#fbbf24" />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>4.9 / 5 Client Rating</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>High satisfaction across 1,200+ cuts</div>
            </div>
          </div>
        </div>
      </section>

      {/* Disciplines & Categories Section */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Browse Specializations
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 4 }}>
              Explore Editors by Creative Discipline
            </h2>
          </div>
          <Link to="/explore" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>View All Categories</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.slug}`}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '24px',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform var(--transition-normal), border-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Film size={22} />
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {cat.name}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                {cat.description || 'Specialized creative editing and post-production masters.'}
              </p>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 600, color: '#818cf8' }}>
                <span>Discover Talent</span>
                <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Editors Showcase */}
      <section style={{ maxWidth: 1240, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Vetted Creatives
            </span>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 4 }}>
              Featured Editors Ready for Work
            </h2>
          </div>
          <Link to="/explore" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Explore All Editors</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="editor-grid">
          {featuredEditors.map((editor) => (
            <div key={editor.id} className="editor-card">
              <div className="editor-card-header">
                <div className="editor-avatar-wrap">
                  {editor.avatarUrl ? (
                    <img src={editor.avatarUrl} alt={editor.fullName} className="editor-avatar-img" />
                  ) : (
                    <div className="editor-avatar-fallback">{editor.fullName.charAt(0)}</div>
                  )}
                  <span className={`status-dot ${editor.availability || 'available'}`} />
                </div>

                <div className="editor-identity">
                  <div className="editor-name-row">
                    <Link to={`/editors/${editor.id}`} className="editor-card-name">
                      {editor.fullName}
                    </Link>
                    {editor.experienceLevel === 'pro' && <span className="badge-pro">PRO</span>}
                  </div>
                  <div className="editor-card-headline">{editor.headline}</div>
                  <div className="editor-meta-row">
                    {editor.location && (
                      <div className="meta-item">
                        <MapPin size={12} />
                        <span>{editor.location}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <Clock size={12} />
                      <span style={{ textTransform: 'capitalize' }}>{editor.availability}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Previews */}
              {editor.portfolioPreview && editor.portfolioPreview.length > 0 && (
                <div className="editor-portfolio-preview">
                  {editor.portfolioPreview.map((item) => (
                    <div
                      key={item.id}
                      className="preview-thumb-box"
                      onClick={() => setActivePortfolioItem({ item, editor })}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={item.thumbnailUrl || item.thumbnail} alt={item.title} />
                      {item.editorRole && <div className="preview-badge-overlay">{item.editorRole}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Software tags */}
              <div className="software-badges-row">
                {editor.software.slice(0, 4).map((sw, idx) => (
                  <span key={idx} className="software-tag">
                    {sw}
                  </span>
                ))}
              </div>

              {/* Card Footer */}
              <div className="editor-card-footer">
                <div>
                  <span className="editor-card-rate">Starting Rate</span>
                  <span className="editor-card-price">${editor.startingPrice}</span>
                </div>

                <div className="editor-card-actions">
                  <Link to={`/editors/${editor.id}`} className="btn btn-secondary btn-sm">
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => setHireTargetEditor(editor)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>Hire</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Seamless Workflow
          </span>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', margin: '8px 0 24px' }}>
            How Pixel Pedia Works
          </h2>

          {/* Toggle Role */}
          <div style={{ display: 'inline-flex', padding: 4, background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-subtle)', marginBottom: 48 }}>
            <button
              type="button"
              onClick={() => setHowItWorksRole('client')}
              style={{
                padding: '8px 24px',
                borderRadius: 'var(--radius-full)',
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                background: howItWorksRole === 'client' ? 'var(--primary)' : 'transparent',
                color: howItWorksRole === 'client' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              For Clients Looking to Hire
            </button>
            <button
              type="button"
              onClick={() => setHowItWorksRole('editor')}
              style={{
                padding: '8px 24px',
                borderRadius: 'var(--radius-full)',
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                background: howItWorksRole === 'editor' ? 'var(--primary)' : 'transparent',
                color: howItWorksRole === 'editor' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              For Editors & Creators
            </button>
          </div>

          {/* Steps Grid */}
          {howItWorksRole === 'client' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, textAlign: 'left' }}>
              <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>01</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Discover Top Talent</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Filter by discipline, NLE/VFX software, pricing tier, and availability. Review real showreels and verified portfolio plates.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>02</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Dispatch Structured Brief</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Specify your exact story narrative, target deliverables (ProRes/4K/vertical cuts), references, and target budget.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>03</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Review & Receive Masters</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Collaborate directly with your editor, track milestones, and receive final mastered export stems and project files.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, textAlign: 'left' }}>
              <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#c084fc', marginBottom: 12 }}>01</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Build Your Showcase</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Upload your commercial cuts, motion graphics, and color grading reels. Tag the software used (Premiere, DaVinci, Blender).
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#c084fc', marginBottom: 12 }}>02</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Receive Structured Inquiries</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Get inquiries with pre-defined deliverables, timelines, and budget expectations instead of vague one-line messages.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: 28, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#c084fc', marginBottom: 12 }}>03</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Accept, Edit & Deliver</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Accept jobs that match your creative style and rate card. Build long-term client relationships and repeat work.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* High-Impact CTA Banner */}
      <section style={{ maxWidth: 1040, margin: '80px auto', padding: '0 24px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: 24,
            padding: '56px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: 14, letterSpacing: '-0.02em' }}>
            Ready to Transform Your Visual Content?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 620, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Whether you need a high-impact broadcast commercial cut or want to showcase your editorial talent, Pixel Pedia is your creative home.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14 }}>
            <Link to="/explore" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>Find an Editor Now</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/signup" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: 15 }}>
              Join as a Video Editor
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '48px 24px', background: 'var(--bg-surface)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
              <div className="marketplace-logo-icon" style={{ width: 30, height: 30 }}>
                <Clapperboard size={16} />
              </div>
              <span>Pixel Pedia</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.6 }}>
              The premiere freelancing marketplace for video editors, colorists, sound designers, and motion graphics creators.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                Marketplace
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <Link to="/explore">Explore Talent</Link>
                <Link to="/explore?category=video-editing">Film & Commercial</Link>
                <Link to="/explore?category=motion-graphics">3D Motion</Link>
                <Link to="/explore?category=color-grading">Color Grading</Link>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                For Creators
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <Link to="/signup">Join as Editor</Link>
                <Link to="/login">Creator Sign In</Link>
                <Link to="/dashboard/portfolio">Portfolio Guidelines</Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '32px auto 0', paddingTop: 24, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', flexWrap: 'wrap', gap: 12 }}>
          <span>© 2026 Pixel Pedia Marketplace. All rights reserved.</span>
          <span>Crafted for high-end post-production teams & independent creators.</span>
        </div>
      </footer>

      {/* Hire Modal */}
      {hireTargetEditor && (
        <ProjectRequestModal
          isOpen={Boolean(hireTargetEditor)}
          onClose={() => setHireTargetEditor(null)}
          targetEditor={hireTargetEditor}
        />
      )}

      {/* Lightbox / Portfolio Detail Modal */}
      {activePortfolioItem && (
        <PortfolioDetailModal
          item={activePortfolioItem.item}
          editor={activePortfolioItem.editor}
          onClose={() => setActivePortfolioItem(null)}
          onHireForSimilar={() => {
            setHireTargetEditor(activePortfolioItem.editor);
            setActivePortfolioItem(null);
          }}
        />
      )}
    </div>
  );
};
