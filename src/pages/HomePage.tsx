import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Clock,
  Clapperboard,
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

  // Featured curated gallery pieces
  const galleryLead = DEMO_PORTFOLIO_ITEMS[0]; // Apex Horizon
  const galleryLeadEditor = featuredEditors.find((e) => e.id === galleryLead?.editorId) || featuredEditors[0];
  const gallerySub1 = DEMO_PORTFOLIO_ITEMS[1]; // Cybernetic Identity
  const gallerySub1Editor = featuredEditors.find((e) => e.id === gallerySub1?.editorId) || featuredEditors[1];
  const gallerySub2 = DEMO_PORTFOLIO_ITEMS[2]; // Neon Tokyo
  const gallerySub2Editor = featuredEditors.find((e) => e.id === gallerySub2?.editorId) || featuredEditors[2];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)', overflowX: 'hidden' }}>
      <MarketplaceNavbar />

      {/* Editorial Asymmetric Hero Section */}
      <section className="market-hero-editorial">
        <div>
          <div className="market-hero-meta-kicker">
            <span className="kicker-dot" />
            <span>Curated Directory & Talent Marketplace</span>
            <span>/</span>
            <span>Vol. 04</span>
          </div>

          <h1 className="market-hero-title">
            Find & Hire World-Class <br />
            <em>Editors & Creative Talent</em>
          </h1>

          <p className="market-hero-sub">
            An independent, vetted directory connecting directors, brands, and creators with premier narrative film editors, DaVinci colorists, 3D motion designers, and sound artists.
          </p>
        </div>

        <div className="market-hero-right-col">
          {/* Integrated Search Box */}
          <form onSubmit={handleSearchSubmit} className="market-search-box">
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="market-search-input"
              placeholder="Try 'YouTube documentary editor', 'DaVinci colorist', '3D motion'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>Search Talent</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Quick Category Discovery Pills */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Specializations Index:
            </div>
            <div className="category-pills-wrap" style={{ marginTop: 0 }}>
              <Link to="/explore?category=video-editing" className="category-pill">
                <span>Commercial & Narrative</span>
              </Link>
              <Link to="/explore?category=motion-graphics" className="category-pill">
                <span>3D Motion Graphics</span>
              </Link>
              <Link to="/explore?category=color-grading" className="category-pill">
                <span>DaVinci Color Grading</span>
              </Link>
              <Link to="/explore?category=audio-post-production" className="category-pill">
                <span>Sound Design</span>
              </Link>
              <Link to="/explore?category=gaming-esports" className="category-pill">
                <span>Esports & Gaming</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Trust Strip */}
      <div className="editorial-trust-strip">
        <div className="trust-strip-item">
          <div className="trust-strip-index">01</div>
          <div>
            <div className="trust-strip-title">100% Vetted Portfolios</div>
            <div className="trust-strip-desc">Verified showreels, original raw project stems & broadcast credits.</div>
          </div>
        </div>

        <div className="trust-strip-item">
          <div className="trust-strip-index">02</div>
          <div>
            <div className="trust-strip-title">24-48h Brief Responses</div>
            <div className="trust-strip-desc">Direct communication with lead editors without agency middlemen.</div>
          </div>
        </div>

        <div className="trust-strip-item">
          <div className="trust-strip-index">03</div>
          <div>
            <div className="trust-strip-title">Structured Milestone Escrow</div>
            <div className="trust-strip-desc">Transparent scopes, clear review cycles, and secure fund protection.</div>
          </div>
        </div>
      </div>

      {/* Curated Editorial Gallery Spread */}
      <section className="editorial-gallery-spread">
        <div className="section-editorial-header">
          <div>
            <div className="section-kicker">Curated Portfolio Spread</div>
            <h2 className="section-editorial-title">Selected Editorial Works</h2>
          </div>
          <Link to="/explore" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>Explore All Works</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="asymmetric-gallery-grid">
          {/* Lead Showcase Plate */}
          {galleryLead && (
            <div
              className="gallery-lead-plate"
              onClick={() => setActivePortfolioItem({ item: galleryLead, editor: galleryLeadEditor })}
            >
              <div className="plate-media-wrap">
                <img
                  src={galleryLead.thumbnailUrl || galleryLead.thumbnail}
                  alt={galleryLead.title}
                />
              </div>
              <div className="plate-caption">
                <div>
                  <div className="plate-title">{galleryLead.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {galleryLead.editorRole || 'Lead Editorial & Color'} • Master Cut
                  </div>
                </div>
                <div className="plate-meta-mono">{galleryLead.projectDuration || '02:14'} • 4K PRORES</div>
              </div>
            </div>
          )}

          {/* Sub Plate 1 */}
          {gallerySub1 && (
            <div
              className="gallery-sub-plate"
              onClick={() => setActivePortfolioItem({ item: gallerySub1, editor: gallerySub1Editor })}
            >
              <div className="plate-media-wrap">
                <img
                  src={gallerySub1.thumbnailUrl || gallerySub1.thumbnail}
                  alt={gallerySub1.title}
                />
              </div>
              <div className="plate-caption">
                <div>
                  <div className="plate-title">{gallerySub1.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {gallerySub1.editorRole || 'Motion Design'} • Commercial Master
                  </div>
                </div>
                <div className="plate-meta-mono">3D MOTION • BLENDER</div>
              </div>
            </div>
          )}

          {/* Sub Plate 2 */}
          {gallerySub2 && (
            <div
              className="gallery-sub-plate"
              onClick={() => setActivePortfolioItem({ item: gallerySub2, editor: gallerySub2Editor })}
            >
              <div className="plate-media-wrap">
                <img
                  src={gallerySub2.thumbnailUrl || gallerySub2.thumbnail}
                  alt={gallerySub2.title}
                />
              </div>
              <div className="plate-caption">
                <div>
                  <div className="plate-title">{gallerySub2.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {gallerySub2.editorRole || 'Finishing & Grading'} • Feature Cut
                  </div>
                </div>
                <div className="plate-meta-mono">DAVINCI • COLOR PASS</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Discipline Index Section */}
      <section className="discipline-index-section">
        <div className="section-editorial-header">
          <div>
            <div className="section-kicker">Discipline Directory</div>
            <h2 className="section-editorial-title">Explore Editors by Creative Discipline</h2>
          </div>
          <Link to="/explore" className="btn btn-secondary btn-sm">
            <span>Directory Index</span>
          </Link>
        </div>

        <div className="discipline-table">
          {categories.slice(0, 6).map((cat, idx) => (
            <Link
              key={cat.id}
              to={`/explore?category=${cat.slug}`}
              className="discipline-row"
            >
              <span className="discipline-num">{(idx + 1).toString().padStart(2, '0')}</span>
              <span className="discipline-title">{cat.name}</span>
              <span className="discipline-desc">{cat.description || 'Specialized narrative and commercial post-production masters.'}</span>
              <span className="discipline-count">Vetted Roster</span>
              <span className="discipline-arrow">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Talent Showcase */}
      <section className="talent-roster-section">
        <div className="section-editorial-header">
          <div>
            <div className="section-kicker">Vetted Creatives</div>
            <h2 className="section-editorial-title">Featured Editors Ready for Work</h2>
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
                        <MapPin size={11} />
                        <span>{editor.location}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <Clock size={11} />
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
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial "How It Works" Section */}
      <section className="editorial-workflow-section">
        <div className="workflow-header">
          <div>
            <div className="section-kicker">Protocol & Engagement</div>
            <h2 className="section-editorial-title">How Pixel Pedia Works</h2>
          </div>

          {/* Toggle Role */}
          <div className="workflow-toggle-strip">
            <button
              type="button"
              onClick={() => setHowItWorksRole('client')}
              className={`workflow-toggle-btn ${howItWorksRole === 'client' ? 'active' : ''}`}
            >
              For Clients Looking to Hire
            </button>
            <button
              type="button"
              onClick={() => setHowItWorksRole('editor')}
              className={`workflow-toggle-btn ${howItWorksRole === 'editor' ? 'active' : ''}`}
            >
              For Editors & Creators
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        {howItWorksRole === 'client' ? (
          <div className="workflow-steps-grid">
            <div className="workflow-step-col">
              <div className="workflow-step-index">[ 01 / DISCOVERY ]</div>
              <h3 className="workflow-step-title">Discover Top Talent</h3>
              <p className="workflow-step-desc">
                Filter by discipline, NLE/VFX software, pricing tier, and availability. Review real showreels and verified portfolio plates.
              </p>
            </div>

            <div className="workflow-step-col">
              <div className="workflow-step-index">[ 02 / BRIEFING ]</div>
              <h3 className="workflow-step-title">Dispatch Structured Brief</h3>
              <p className="workflow-step-desc">
                Specify your exact story narrative, target deliverables (ProRes/4K/vertical cuts), references, and target budget.
              </p>
            </div>

            <div className="workflow-step-col">
              <div className="workflow-step-index">[ 03 / DELIVERY ]</div>
              <h3 className="workflow-step-title">Review & Receive Masters</h3>
              <p className="workflow-step-desc">
                Collaborate directly with your editor, track milestones, and receive final mastered export stems and project files.
              </p>
            </div>
          </div>
        ) : (
          <div className="workflow-steps-grid">
            <div className="workflow-step-col">
              <div className="workflow-step-index">[ 01 / CURATION ]</div>
              <h3 className="workflow-step-title">Build Your Showcase</h3>
              <p className="workflow-step-desc">
                Upload your commercial cuts, motion graphics, and color grading reels. Tag the software used (Premiere, DaVinci, Blender).
              </p>
            </div>

            <div className="workflow-step-col">
              <div className="workflow-step-index">[ 02 / INQUIRIES ]</div>
              <h3 className="workflow-step-title">Receive Structured Inquiries</h3>
              <p className="workflow-step-desc">
                Get inquiries with pre-defined deliverables, timelines, and budget expectations instead of vague one-line messages.
              </p>
            </div>

            <div className="workflow-step-col">
              <div className="workflow-step-index">[ 03 / EXECUTION ]</div>
              <h3 className="workflow-step-title">Accept, Edit & Deliver</h3>
              <p className="workflow-step-desc">
                Accept jobs that match your creative style and rate card. Build long-term client relationships and repeat work.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Understated Editorial Studio CTA */}
      <section className="editorial-cta-section">
        <div className="editorial-cta-box">
          <div>
            <h2 className="cta-title">
              Ready to collaborate with exceptional editorial talent?
            </h2>
            <p className="cta-desc">
              Whether you need a high-impact broadcast commercial cut, a cinematic documentary grade, or want to exhibit your talent as an editor, Pixel Pedia is your dedicated creative platform.
            </p>
          </div>
          <div className="cta-actions">
            <Link to="/explore" className="btn btn-primary btn-lg" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span>Find an Editor Now</span>
              <ArrowRight size={15} />
            </Link>
            <Link to="/signup" className="btn btn-secondary btn-lg" style={{ width: '100%', textAlign: 'center' }}>
              Join as a Video Editor
            </Link>
          </div>
        </div>
      </section>

      {/* Understated Editorial Footer */}
      <footer className="editorial-footer">
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div className="marketplace-logo-mark">
                <Clapperboard size={14} />
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 600 }}>Pixel Pedia</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 300 }}>
              The curated talent directory and freelancing marketplace for video editors, colorists, sound designers, and motion directors.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Marketplace</div>
            <div className="footer-link-list">
              <Link to="/explore">Explore Talent</Link>
              <Link to="/explore?category=video-editing">Film & Commercial</Link>
              <Link to="/explore?category=motion-graphics">Motion Design</Link>
              <Link to="/explore?category=color-grading">Color Grading</Link>
              <Link to="/explore?category=audio-post-production">Audio Post</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Platform</div>
            <div className="footer-link-list">
              <Link to="/login">Client Login</Link>
              <Link to="/signup">Join as Editor</Link>
              <Link to="/dashboard/overview">Creator Dashboard</Link>
              <Link to="/dashboard/requests">Project Requests</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Editorial Note</div>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              All showcase materials remain the intellectual property of their respective creators and production houses. Verified independently for quality and narrative craft.
            </p>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>© {new Date().getFullYear()} Pixel Pedia. Independent Creative Marketplace.</div>
          <div>ISSUE NO. 04 / MONOCHROME EDITION</div>
        </div>
      </footer>

      {/* Project Request Modal */}
      {hireTargetEditor && (
        <ProjectRequestModal
          editor={hireTargetEditor}
          isOpen={Boolean(hireTargetEditor)}
          onClose={() => setHireTargetEditor(null)}
          onSuccess={() => {
            setHireTargetEditor(null);
            alert('Your structured brief has been sent to the editor.');
          }}
        />
      )}

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
    </div>
  );
};
