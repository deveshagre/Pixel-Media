import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, CheckCircle2, Split } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ComparisonProject {
  id: string;
  title: string;
  category: string;
  beforeLabel: string;
  afterLabel: string;
  beforeImg: string;
  afterImg: string;
  beforeDesc: string;
  afterDesc: string;
  techSpecs: string;
}

const COMPARISON_PROJECTS: ComparisonProject[] = [
  {
    id: 'automotive_grade',
    title: 'Automotive Commercial — ARRI RAW to ACEScc Grade',
    category: 'Commercial Film Color Grading',
    beforeLabel: 'RAW LogC3 (Ungraded Flat)',
    afterLabel: 'ACEScc Kodak 2383 3D LUT Master',
    beforeImg: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
    afterImg: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
    beforeDesc: 'Flat dynamic range capture straight from sensor. Low contrast, muted color gamut, desaturated shadows.',
    afterDesc: 'Full ACES 1.3 color space pipeline with warm highlights, deep cinematic blacks, and calibrated metallic reflections.',
    techSpecs: 'ARRI Alexa Mini LF • 4.5K Open Gate • ProRes 4444 XQ • ACEScc Rec.709',
  },
  {
    id: 'fashion_retouch',
    title: 'Luminary Autumn — Editorial Beauty Retouching',
    category: 'High-End Image Retouching',
    beforeLabel: '100MP Studio Plate (Unretouched)',
    afterLabel: 'Frequency Separation & Texture Master',
    beforeImg: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
    afterImg: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=85',
    beforeDesc: 'Microscopic blemishes, uneven studio flash falloff, flyaway hairs, and specular jewelry reflections.',
    afterDesc: 'Preserved organic skin pore texture, non-destructive dodge & burn, eye luminance enhancement, and CMYK pre-press proof.',
    techSpecs: 'Hasselblad H6D-100c • 16-bit TIFF • ProPhoto RGB • Layered PSD',
  },
  {
    id: 'esports_vfx',
    title: 'VCT Champions — 4K60 Remaster & 3D HUD Tracking',
    category: 'Esports & Gaming Content',
    beforeLabel: '1080p Twitch Stream VOD Capture',
    afterLabel: '4K60 Upscaled + 3D HUD & Velocity Ramp',
    beforeImg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=85',
    afterImg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=85',
    beforeDesc: 'Compressed 6Mbps Twitch capture with standard 1080p bitrate and flat stream audio.',
    afterDesc: 'AI-assisted optical flow 4K60 frame synthesis, beat-synced speed ramping, 3D camera pan, and spatial audio mastering.',
    techSpecs: 'NVENC 4K60 Master • 50Mbps VBR • Custom Alpha Stinger • EBU R128',
  },
];

export const BeforeAfterComparison: React.FC = () => {
  const { t } = useLanguage();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('automotive_grade');
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  const activeProject =
    COMPARISON_PROJECTS.find((p) => p.id === selectedProjectId) || COMPARISON_PROJECTS[0];

  const updateSplitFromClientX = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
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
    <section id="comparison" className="home-section" aria-label="Before and After Comparison Slider">
      <div className="section-header">
        <div className="section-badge">
          <Sparkles size={14} />
          <span>Precision Finishing Benchmarks</span>
        </div>
        <h2 className="section-title">{t.home.comparisonTitle}</h2>
        <p className="section-subtitle">{t.home.comparisonSubtitle}</p>
      </div>

      <div className="comparison-container">
        {/* Project Selector Toolbar */}
        <div className="comparison-toolbar">
          <div className="comparison-project-tabs" role="tablist">
            {COMPARISON_PROJECTS.map((proj) => (
              <button
                key={proj.id}
                role="tab"
                aria-selected={selectedProjectId === proj.id}
                onClick={() => setSelectedProjectId(proj.id)}
                className={`comparison-tab-btn ${selectedProjectId === proj.id ? 'active' : ''}`}
              >
                {proj.title}
              </button>
            ))}
          </div>

          {/* Quick Preset Buttons */}
          <div className="comparison-preset-btns">
            <button
              onClick={() => setSplitPercent(0)}
              className={`preset-btn ${splitPercent === 0 ? 'active' : ''}`}
              title="Show 100% Finished Master"
            >
              100% After
            </button>
            <button
              onClick={() => setSplitPercent(50)}
              className={`preset-btn ${splitPercent === 50 ? 'active' : ''}`}
              title="Split View 50/50"
            >
              <Split size={12} style={{ display: 'inline', marginRight: 4 }} />
              50 / 50
            </button>
            <button
              onClick={() => setSplitPercent(100)}
              className={`preset-btn ${splitPercent === 100 ? 'active' : ''}`}
              title="Show 100% Original Raw Capture"
            >
              100% Before
            </button>
          </div>
        </div>

        {/* Interactive Split Viewport */}
        <div
          ref={containerRef}
          className="comparison-viewport"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="slider"
          aria-valuenow={splitPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Comparison slider: ${splitPercent}% Original, ${100 - splitPercent}% Finished`}
        >
          {/* Layer 2: "After" Image (Finished Master) */}
          <div className="comparison-layer">
            <img
              src={activeProject.afterImg}
              alt={activeProject.afterLabel}
            />
          </div>

          {/* Layer 1: "Before" Image (Clipped to splitPercent) */}
          <div
            className="comparison-layer"
            style={{
              clipPath: `polygon(0% 0%, ${splitPercent}% 0%, ${splitPercent}% 100%, 0% 100%)`,
              filter: selectedProjectId === 'automotive_grade'
                ? 'saturate(0.35) contrast(0.70) brightness(1.15) sepia(0.05)'
                : selectedProjectId === 'fashion_retouch'
                ? 'saturate(0.40) contrast(0.76) brightness(1.10)'
                : 'saturate(0.30) contrast(0.68) brightness(1.22)',
            }}
          >
            <img
              src={activeProject.beforeImg}
              alt={activeProject.beforeLabel}
            />
          </div>

          {/* Left Badge: Before */}
          <div className="comparison-badge comparison-badge-before">
            {activeProject.beforeLabel}
          </div>

          {/* Right Badge: After */}
          <div className="comparison-badge comparison-badge-after">
            <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
            {activeProject.afterLabel}
          </div>

          {/* Split Divider Line and Draggable Handle */}
          <div
            className="split-divider-line"
            style={{ left: `${splitPercent}%` }}
          >
            <div
              className="split-drag-handle"
              title="Drag or use Left/Right arrow keys to slide"
            >
              <ChevronLeft size={16} />
              <ChevronRight size={16} />
            </div>
          </div>
        </div>

        {/* Technical Metadata Footer */}
        <div className="comparison-meta-footer">
          <div>
            <strong style={{ color: '#f1f5f9' }}>Technical Standards: </strong>
            <span>{activeProject.techSpecs}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
              SPLIT: {splitPercent}% RAW / {100 - splitPercent}% MASTER
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
