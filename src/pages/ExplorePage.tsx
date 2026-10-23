import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Clock,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { MarketplaceNavbar } from '../components/marketplace/MarketplaceNavbar';
import { ProjectRequestModal } from '../components/marketplace/ProjectRequestModal';
import { PortfolioDetailModal } from '../components/marketplace/PortfolioDetailModal';
import { useCategories, useEditorDiscovery } from '../hooks/useMarketplace';
import { EditorCard, PortfolioItem, COMMON_SOFTWARE, ExperienceLevel, Availability } from '../types';

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();

  // Search & Filter state derived from URL or local
  const currentQuery = searchParams.get('q') || '';
  const currentCatSlug = searchParams.get('category') || '';
  const currentSw = searchParams.get('software') || '';
  const currentExp = (searchParams.get('level') as ExperienceLevel) || '';
  const currentAvail = (searchParams.get('avail') as Availability) || '';
  const currentSort = (searchParams.get('sort') as 'relevance' | 'price_low' | 'price_high') || 'relevance';

  const [queryInput, setQueryInput] = useState(currentQuery);

  // Discovery Hook
  const { editors, loading } = useEditorDiscovery({
    query: currentQuery,
    categorySlug: currentCatSlug || undefined,
    software: currentSw || undefined,
    experienceLevel: currentExp || undefined,
    availability: currentAvail || undefined,
    sortBy: currentSort,
  });

  // Modals state
  const [hireTargetEditor, setHireTargetEditor] = useState<EditorCard | null>(null);
  const [activePortfolioItem, setActivePortfolioItem] = useState<{
    item: PortfolioItem;
    editor: EditorCard;
  } | null>(null);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('q', queryInput.trim());
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setQueryInput('');
  };

  const hasActiveFilters = Boolean(currentQuery || currentCatSlug || currentSw || currentExp || currentAvail);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <MarketplaceNavbar />

      <main className="discovery-container">
        {/* Header Title */}
        <div className="discovery-header">
          <div className="section-kicker">TALENT ARCHIVE & DIRECTORY</div>
          <h1 className="discovery-title">
            Find & Hire Video Editors & Creators
          </h1>
          <p className="discovery-subtitle">
            Curated roster of independent narrative film editors, commercial colorists, 3D motion designers, and sound artists.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="discovery-filter-card">
          {/* Top Row: Search input + Software select + Sort */}
          <div className="filter-row-top">
            <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: 260, position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, style, or skills..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                style={{ paddingLeft: 38, height: 42 }}
              />
              <Search
                size={16}
                style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }}
              />
            </form>

            {/* Software filter */}
            <select
              className="filter-dropdown-select"
              value={currentSw}
              onChange={(e) => updateParam('software', e.target.value)}
              aria-label="Filter by software"
            >
              <option value="">All Software Tools</option>
              {COMMON_SOFTWARE.map((sw) => (
                <option key={sw} value={sw}>
                  {sw}
                </option>
              ))}
            </select>

            {/* Experience level */}
            <select
              className="filter-dropdown-select"
              value={currentExp}
              onChange={(e) => updateParam('level', e.target.value)}
              aria-label="Filter by experience level"
            >
              <option value="">Any Experience Level</option>
              <option value="pro">Pro / Studio Level</option>
              <option value="beginner">Rising Creator</option>
            </select>

            {/* Availability */}
            <select
              className="filter-dropdown-select"
              value={currentAvail}
              onChange={(e) => updateParam('avail', e.target.value)}
              aria-label="Filter by availability"
            >
              <option value="">Any Availability</option>
              <option value="available">Available Now</option>
              <option value="busy">Busy (Accepting Next Week)</option>
            </select>

            {/* Sort */}
            <select
              className="filter-dropdown-select"
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              aria-label="Sort editors"
            >
              <option value="relevance">Featured / Relevance</option>
              <option value="price_low">Starting Rate: Low to High</option>
              <option value="price_high">Starting Rate: High to Low</option>
            </select>
          </div>

          {/* Category Chips Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 6 }}>
            <div className="filter-chip-group">
              <button
                type="button"
                onClick={() => updateParam('category', '')}
                className={`filter-chip ${!currentCatSlug ? 'active' : ''}`}
              >
                All Disciplines
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateParam('category', cat.slug)}
                  className={`filter-chip ${currentCatSlug === cat.slug ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', textUnderlineOffset: 3, fontSize: 12.5, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{editors.length}</strong> available editors
          </div>
        </div>

        {/* Editors Grid */}
        {loading ? (
          <div style={{ padding: '64px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading vetted marketplace editors...
          </div>
        ) : editors.length === 0 ? (
          <div
            style={{
              padding: '64px 24px',
              textAlign: 'center',
              background: 'var(--bg-surface)',
              borderRadius: 16,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <Layers size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No editors found</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              Try broadening your search query, selecting "All Disciplines", or clearing software filters.
            </p>
            <button onClick={clearAllFilters} className="btn btn-secondary btn-sm">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="editor-grid">
            {editors.map((editor) => (
              <div key={editor.id} className="editor-card">
                {/* Header: Avatar, Name, Experience, Availability */}
                <div className="editor-card-header">
                  <div className="editor-avatar-wrap">
                    {editor.avatarUrl ? (
                      <img src={editor.avatarUrl} alt={editor.fullName} className="editor-avatar-img" />
                    ) : (
                      <div className="editor-avatar-fallback">
                        {editor.fullName.charAt(0)}
                      </div>
                    )}
                    <span
                      className={`status-dot ${editor.availability || 'available'}`}
                      title={`Status: ${editor.availability || 'available'}`}
                    />
                  </div>

                  <div className="editor-identity">
                    <div className="editor-name-row">
                      <Link
                        to={`/editors/${editor.id}`}
                        className="editor-card-name"
                        title={editor.fullName}
                      >
                        {editor.fullName}
                      </Link>
                      {editor.experienceLevel === 'pro' && (
                        <span className="badge-pro">PRO</span>
                      )}
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
                        <span style={{ textTransform: 'capitalize' }}>
                          {editor.availability === 'available' ? 'Available now' : editor.availability}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Portfolio Preview Reels (3 items) */}
                {editor.portfolioPreview && editor.portfolioPreview.length > 0 && (
                  <div className="editor-portfolio-preview">
                    {editor.portfolioPreview.map((item) => (
                      <div
                        key={item.id}
                        className="preview-thumb-box"
                        onClick={() => setActivePortfolioItem({ item, editor })}
                        style={{ cursor: 'pointer' }}
                        title={`${item.title} (Click to inspect)`}
                      >
                        <img
                          src={item.thumbnailUrl || item.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=75'}
                          alt={item.title}
                        />
                        {item.editorRole && (
                          <div className="preview-badge-overlay">{item.editorRole}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Software tags */}
                {editor.software && editor.software.length > 0 && (
                  <div className="software-badges-row">
                    {editor.software.slice(0, 4).map((sw, idx) => (
                      <span key={idx} className="software-tag">
                        {sw}
                      </span>
                    ))}
                    {editor.software.length > 4 && (
                      <span className="software-tag" style={{ opacity: 0.7 }}>
                        +{editor.software.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Card Footer: Starting Rate & Action Buttons */}
                <div className="editor-card-footer">
                  <div>
                    <span className="editor-card-rate">Starting Rate</span>
                    {editor.startingPrice ? (
                      <span className="editor-card-price">${editor.startingPrice}</span>
                    ) : (
                      <span className="editor-card-price" style={{ fontSize: 13 }}>Custom Quote</span>
                    )}
                  </div>

                  <div className="editor-card-actions">
                    <Link
                      to={`/editors/${editor.id}`}
                      className="btn btn-secondary btn-sm"
                    >
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
        )}
      </main>

      {/* Hire & Project Brief Modal */}
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
