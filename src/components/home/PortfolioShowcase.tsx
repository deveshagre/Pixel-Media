import React, { useState, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { PORTFOLIO_ITEMS } from '../../data/portfolioData';
import { PortfolioItem, ServiceCategory } from '../../types';

interface PortfolioShowcaseProps {
  onStartSimilarProject: (category: ServiceCategory) => void;
}

const CATEGORIES: { id: ServiceCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Work' },
  { id: 'video_editing', label: 'Film & Commercial' },
  { id: 'image_editing', label: 'Retouching' },
  { id: 'audio_editing', label: 'Sound & Audio' },
  { id: 'esports_gaming', label: 'Esports' },
  { id: 'graphic_design', label: 'Design' },
  { id: 'motion_graphics', label: '3D Motion' },
];

export const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({
  onStartSimilarProject,
}) => {
  const [activeFilter, setActiveFilter] = useState<ServiceCategory | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);

  // Before & After Slider State
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const sliderBoxRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const filteredItems =
    activeFilter === 'all'
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === activeFilter);

  const updateSplitFromClientX = useCallback((clientX: number) => {
    if (!sliderBoxRef.current) return;
    const rect = sliderBoxRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSplitPercent(Math.round(ratio));
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateSplitFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      updateSplitFromClientX(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSplitPercent((prev) => Math.max(0, prev - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSplitPercent((prev) => Math.min(100, prev + 5));
    }
  };

  return (
    <section id="work" className="studio-section" aria-label="Curated Work">
      <div className="studio-container">
        {/* Editorial Section Header */}
        <div className="portfolio-editorial-header">
          <div>
            <span className="editorial-label">Selected Projects</span>
            <h2 className="editorial-headline" style={{ marginBottom: 0 }}>
              Crafted with intention.
            </h2>
          </div>

          {/* Clean Category Filters */}
          <div className="editorial-filter-row" role="tablist">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeFilter === cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`editorial-filter-btn ${activeFilter === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Varied Composition Editorial Grid */}
        <div className="editorial-grid">
          {filteredItems.map((item, index) => {
            // Asymmetric layout logic for varied image compositions
            let layoutClass = 'portfolio-item-third';
            if (activeFilter === 'all') {
              if (index === 0) layoutClass = 'portfolio-item-hero';
              else if (index === 1 || index === 2) layoutClass = 'portfolio-item-half';
            }

            return (
              <div
                key={item.id}
                className={`editorial-card ${layoutClass}`}
                onClick={() => setSelectedProject(item)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${item.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedProject(item);
                  }
                }}
              >
                <div
                  className="editorial-media-wrap"
                  style={{
                    aspectRatio: layoutClass === 'portfolio-item-hero' ? '21 / 9' : '16 / 10',
                  }}
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="editorial-card-img"
                    loading="lazy"
                  />
                </div>

                <div className="editorial-card-meta">
                  <h3 className="editorial-card-title">{item.title}</h3>
                  <span className="editorial-card-year">{item.year}</span>
                </div>
                <div className="editorial-card-tag">
                  {item.clientName} — {item.categoryLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Before & After Comparison Feature */}
        <div className="comparison-editorial-block">
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span className="editorial-label">Finishing Benchmark</span>
              <h3 style={{ fontSize: 24, fontWeight: 600, color: '#ffffff' }}>
                Color Grading & Retouching Precision
              </h3>
            </div>
            <span style={{ fontSize: 13, color: '#71717a', fontFamily: 'monospace' }}>
              DRAG SLIDER TO REVEAL MASTER GRADE
            </span>
          </div>

          <div
            ref={sliderBoxRef}
            className="comparison-editorial-slider-box"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            role="slider"
            aria-valuenow={splitPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Comparison slider: ${splitPercent}% RAW, ${100 - splitPercent}% Master`}
          >
            {/* Graded Finished Master Layer */}
            <div className="slider-img-layer">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85"
                alt="Finished Master Grade"
              />
            </div>

            {/* RAW Flat Log Layer */}
            <div
              className="slider-img-layer"
              style={{
                clipPath: `polygon(0% 0%, ${splitPercent}% 0%, ${splitPercent}% 100%, 0% 100%)`,
                filter: 'saturate(0.55) contrast(0.85) brightness(1.08)',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=70"
                alt="RAW Log Sensor Capture"
              />
            </div>

            {/* Labels */}
            <div className="slider-tag-pill" style={{ left: 16 }}>
              RAW Sensor Capture
            </div>
            <div className="slider-tag-pill" style={{ right: 16 }}>
              Final Master Grade
            </div>

            {/* Split Handle Line */}
            <div className="slider-handle-line" style={{ left: `${splitPercent}%` }}>
              <div className="slider-handle-knob" title="Drag to slide">
                <ChevronLeft size={14} />
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Project Detail Modal */}
        {selectedProject && (
          <div
            className="modal-backdrop-cinematic"
            role="dialog"
            aria-modal="true"
            onClick={() => setSelectedProject(null)}
          >
            <div
              className="project-modal-container"
              style={{ background: '#0e0e12', border: '1px solid rgba(255,255,255,0.1)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="project-modal-hero">
                <img
                  src={selectedProject.thumbnail}
                  alt={selectedProject.title}
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="project-modal-close-btn"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="project-modal-content">
                <span className="editorial-label" style={{ marginBottom: 8 }}>
                  {selectedProject.categoryLabel} — {selectedProject.year}
                </span>
                <h2 style={{ fontSize: 28, fontWeight: 600, color: '#ffffff', marginBottom: 12 }}>
                  {selectedProject.title}
                </h2>
                <div style={{ color: '#71717a', fontSize: 14, marginBottom: 20 }}>
                  Client: {selectedProject.clientName} • Scope: {selectedProject.durationOrScope}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: '#a1a1aa', marginBottom: 28 }}>
                  {selectedProject.description}
                </p>

                <div style={{ marginBottom: 32 }}>
                  <div className="editorial-label">Master Deliverables</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                    {selectedProject.deliverables.map((deliv, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: 6,
                          fontSize: 13.5,
                          color: '#e4e4e7',
                        }}
                      >
                        <CheckCircle2 size={15} color="#ffffff" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button onClick={() => setSelectedProject(null)} className="studio-btn-subtle">
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const cat = selectedProject.category;
                      setSelectedProject(null);
                      onStartSimilarProject(cat);
                    }}
                    className="studio-btn-primary"
                  >
                    <span>Start a project like this</span>
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
