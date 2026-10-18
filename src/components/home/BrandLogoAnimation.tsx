import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface BrandLogoAnimationProps {
  reducedMotion: boolean;
}

export const BrandLogoAnimation: React.FC<BrandLogoAnimationProps> = ({ reducedMotion }) => {
  const { t } = useLanguage();
  const [animKey, setAnimKey] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setIsCompleted(true);
      return;
    }
    const timer = setTimeout(() => {
      setIsCompleted(true);
    }, 2400);
    return () => clearTimeout(timer);
  }, [animKey, reducedMotion]);

  const handleReplay = () => {
    setIsCompleted(false);
    setAnimKey((prev) => prev + 1);
  };

  return (
    <section className="home-section" style={{ paddingBottom: 0, paddingTop: 40 }} aria-label="Brand Introduction">
      <div className="brand-intro-card" key={animKey}>
        <div className="brand-intro-grid">
          <div className="brand-intro-left">
            <div className="aperture-visual" aria-hidden="true">
              <div className="aperture-ring" />
              <div className="aperture-core">
                <Sparkles size={22} />
              </div>
            </div>

            <div className="brand-intro-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: '#10b981',
                    background: 'rgba(16, 185, 129, 0.12)',
                    padding: '2px 8px',
                    borderRadius: 4,
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    letterSpacing: '0.05em',
                  }}
                >
                  STUDIO ENGINE 2.4 // ONLINE
                </span>
                <span style={{ fontSize: 11, color: '#64748b' }}>•</span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                  ACEScc 3D LUT READY
                </span>
              </div>
              <h3>Pixel Media // Post-Production Suite</h3>
              <p>
                Engineered for commercial directors, beauty retouchers, broadcast networks, and esports creators.
              </p>
            </div>
          </div>

          <div className="brand-intro-actions">
            <button
              onClick={handleReplay}
              className="nav-tool-btn"
              title="Replay brand introduction sequence"
              aria-label={t.home.replayLogo}
            >
              <RotateCcw size={14} />
              <span>{t.home.replayLogo}</span>
            </button>
            {!isCompleted && !reducedMotion && (
              <button
                onClick={() => setIsCompleted(true)}
                className="nav-tool-btn"
                aria-label={t.home.skipIntro}
              >
                <span>{t.home.skipIntro}</span>
              </button>
            )}
            <a
              href="#timeline-demo"
              className="nav-tool-btn active"
              style={{ textDecoration: 'none' }}
            >
              <Play size={14} fill="#a5b4fc" />
              <span>{t.home.launchTimeline}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
