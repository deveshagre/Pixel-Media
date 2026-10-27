import React, { useState, useEffect, useCallback, useRef } from 'react';
import './cinematic-intro.css';
import logoImg from '../../assets/logo.png';

const SESSION_KEY = 'pixel-media-intro-seen';
const INTRO_DURATION = 4200; // ms — total animation length
const SKIP_FADE_DURATION = 500; // ms — fade out when skipping

interface CinematicIntroProps {
  /** Called when the intro finishes or is skipped */
  onComplete: () => void;
}

/**
 * Cinematic studio-logo reveal for Pixel Media.
 *
 * Plays once per browser session (sessionStorage). Respects
 * `prefers-reduced-motion` by skipping the animation entirely.
 * A "Skip Intro" control is always visible for manual bypass.
 */
export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<
    'idle' | 'particles' | 'monogram' | 'wordmark' | 'flourish' | 'fadeout' | 'done'
  >('idle');
  const [skipping, setSkipping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  // Skip handler
  const handleSkip = useCallback(() => {
    if (skipping || phase === 'done') return;
    setSkipping(true);
    clearAllTimeouts();
    addTimeout(() => {
      setPhase('done');
      sessionStorage.setItem(SESSION_KEY, '1');
      onComplete();
    }, SKIP_FADE_DURATION);
  }, [skipping, phase, clearAllTimeouts, addTimeout, onComplete]);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onComplete();
      return;
    }

    // Check session storage
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      onComplete();
      return;
    }

    // Start the animation sequence
    // Phase timeline:
    //   0ms      — idle → particles (particle field appears)
    //   400ms    — particles → monogram (P monogram draws in)
    //   1600ms   — monogram → wordmark (PIXEL MEDIA text reveals)
    //   2800ms   — wordmark → flourish (accent line + subtle glow)
    //   3500ms   — flourish → fadeout (entire intro fades out)
    //   4200ms   — fadeout → done (remove from DOM)

    addTimeout(() => setPhase('particles'), 50);
    addTimeout(() => setPhase('monogram'), 400);
    addTimeout(() => setPhase('wordmark'), 1600);
    addTimeout(() => setPhase('flourish'), 2800);
    addTimeout(() => setPhase('fadeout'), 3500);
    addTimeout(() => {
      setPhase('done');
      sessionStorage.setItem(SESSION_KEY, '1');
      onComplete();
    }, INTRO_DURATION);

    return clearAllTimeouts;
  }, [onComplete, addTimeout, clearAllTimeouts]);

  // Don't render if already complete
  if (phase === 'done') return null;

  return (
    <div
      ref={containerRef}
      className={`cinematic-intro ${phase} ${skipping ? 'skipping' : ''}`}
      aria-hidden="true"
      data-testid="cinematic-intro"
    >
      {/* Particle field — subtle floating dots */}
      <div className="intro-particle-field" data-testid="particle-field">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="intro-particle"
            style={{
              '--px': `${10 + Math.random() * 80}%`,
              '--py': `${10 + Math.random() * 80}%`,
              '--delay': `${Math.random() * 1.2}s`,
              '--drift-x': `${(Math.random() - 0.5) * 60}px`,
              '--drift-y': `${(Math.random() - 0.5) * 40}px`,
              '--size': `${1.5 + Math.random() * 2.5}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Central logo group */}
      <div className="intro-logo-group">
        {/* Official Pixel Media Logo Emblem */}
        <div className="intro-monogram" data-testid="monogram">
          <img
            src={logoImg}
            alt="Pixel Media"
            className="intro-logo-artwork"
            data-testid="intro-logo-img"
          />
        </div>

        {/* Wordmark */}
        <div className="intro-wordmark" data-testid="wordmark">
          <span className="wordmark-pixel">PIXEL</span>
          <span className="wordmark-separator" />
          <span className="wordmark-media">MEDIA</span>
        </div>

        {/* Accent underline */}
        <div className="intro-accent-line" />

        {/* Tagline */}
        <div className="intro-tagline">A HOME FOR CREATIVE TALENT</div>
      </div>

      {/* Skip control */}
      <button
        className="intro-skip-btn"
        onClick={handleSkip}
        data-testid="skip-intro-btn"
        type="button"
        aria-label="Skip intro animation"
      >
        <span className="skip-text">Skip Intro</span>
        <span className="skip-key">ESC</span>
      </button>
    </div>
  );
};

/**
 * Hook to manage cinematic intro state.
 * Returns whether the intro should be shown and a completion handler.
 */
export function useCinematicIntro() {
  const [showIntro, setShowIntro] = useState(() => {
    // Check reduced-motion first
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return false;
      return sessionStorage.getItem(SESSION_KEY) !== '1';
    }
    return false;
  });

  const handleComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  return { showIntro, handleComplete };
}
