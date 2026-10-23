import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import { CinematicIntro, useCinematicIntro } from '../components/cinematic/CinematicIntro';

/** Helper to render CinematicIntro with a spy callback */
function renderIntro(onComplete = vi.fn()) {
  const result = render(<CinematicIntro onComplete={onComplete} />);
  return { ...result, onComplete };
}

/** Test harness that uses the hook */
function HookHarness() {
  const { showIntro, handleComplete } = useCinematicIntro();
  return (
    <div>
      <div data-testid="show-intro">{String(showIntro)}</div>
      {showIntro && <CinematicIntro onComplete={handleComplete} />}
    </div>
  );
}

describe('Cinematic Intro', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.useFakeTimers();
    // Default: no reduced-motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the intro overlay on first visit', () => {
    renderIntro();
    expect(screen.getByTestId('cinematic-intro')).toBeInTheDocument();
    expect(screen.getByTestId('monogram')).toBeInTheDocument();
    expect(screen.getByTestId('wordmark')).toBeInTheDocument();
    expect(screen.getByTestId('skip-intro-btn')).toBeInTheDocument();
  });

  it('plays through the full animation and calls onComplete', async () => {
    const onComplete = vi.fn();
    renderIntro(onComplete);

    // Intro should be visible initially
    expect(screen.getByTestId('cinematic-intro')).toBeInTheDocument();

    // Advance past the full animation duration (4200ms)
    act(() => {
      vi.advanceTimersByTime(4300);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('pixel-pedia-intro-seen')).toBe('1');
  });

  it('suppresses replay on the same session (sessionStorage)', () => {
    sessionStorage.setItem('pixel-pedia-intro-seen', '1');
    const onComplete = vi.fn();
    renderIntro(onComplete);

    // Should immediately call onComplete without rendering
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('skips intro when the Skip Intro button is clicked', () => {
    const onComplete = vi.fn();
    renderIntro(onComplete);

    const skipBtn = screen.getByTestId('skip-intro-btn');
    fireEvent.click(skipBtn);

    // Advance past the skip fade duration (500ms)
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('pixel-pedia-intro-seen')).toBe('1');
  });

  it('respects prefers-reduced-motion and does not show intro', () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const onComplete = vi.fn();
    renderIntro(onComplete);

    // Should immediately complete
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem('pixel-pedia-intro-seen')).toBe('1');
  });

  it('renders particle field with 24 particles', () => {
    renderIntro();
    const particleField = screen.getByTestId('particle-field');
    const particles = particleField.querySelectorAll('.intro-particle');
    expect(particles.length).toBe(24);
  });

  it('useCinematicIntro hook returns showIntro=true on first visit', () => {
    render(<HookHarness />);
    expect(screen.getByTestId('show-intro').textContent).toBe('true');
    expect(screen.getByTestId('cinematic-intro')).toBeInTheDocument();
  });

  it('useCinematicIntro hook returns showIntro=false after session replay', () => {
    sessionStorage.setItem('pixel-pedia-intro-seen', '1');
    render(<HookHarness />);
    expect(screen.getByTestId('show-intro').textContent).toBe('false');
    expect(screen.queryByTestId('cinematic-intro')).not.toBeInTheDocument();
  });
});
