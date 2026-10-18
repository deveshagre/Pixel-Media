import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Grid,
  Info,
  Layers,
  Sparkles,
  Film,
  Music,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface TimelineClipDef {
  id: string;
  name: string;
  track: 'V1' | 'V2' | 'GFX' | 'A1' | 'A2';
  startSec: number;
  endSec: number;
  colorClass: string;
  footageUrl: string;
  tag: string;
  codec: string;
  resolution: string;
}

const TOTAL_DURATION_SEC = 165; // 00:02:45:00

const CLIPS: TimelineClipDef[] = [
  {
    id: 'clip-v1-1',
    name: '01_Cyber_City_Arrival_RawLog.mov',
    track: 'V1',
    startSec: 0,
    endSec: 35,
    colorClass: 'clip-color-v1-a',
    footageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80',
    tag: 'Narrative Opening // Night Exterior',
    codec: 'Apple ProRes 422 HQ',
    resolution: '3840 x 2160 (4K UHD) @ 24.00fps',
  },
  {
    id: 'clip-v1-2',
    name: '02_Supercar_Speed_Ramp_ACES.mov',
    track: 'V1',
    startSec: 35,
    endSec: 75,
    colorClass: 'clip-color-v1-b',
    footageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80',
    tag: 'Automotive Commercial // Velocity Ramp',
    codec: 'REDCODE RAW 8K -> 4K',
    resolution: '3840 x 2160 (4K UHD) @ 60.00fps',
  },
  {
    id: 'clip-v1-3',
    name: '03_Fashion_Luminary_BeautyPlate.mov',
    track: 'V1',
    startSec: 75,
    endSec: 120,
    colorClass: 'clip-color-v1-c',
    footageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80',
    tag: 'Fashion Editorial // Frequency Separation',
    codec: 'ARRI ProRes 4444 XQ',
    resolution: '4096 x 2160 (DCI 4K) @ 24.00fps',
  },
  {
    id: 'clip-v1-4',
    name: '04_VCT_Grand_Finals_Clutch.mp4',
    track: 'V1',
    startSec: 120,
    endSec: 165,
    colorClass: 'clip-color-v1-d',
    footageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80',
    tag: 'Esports Championship // 3D Camera Tracking',
    codec: 'H.265 High Profile (Crisp 60fps)',
    resolution: '3840 x 2160 (4K UHD) @ 60.00fps',
  },
];

export const TimelineDemonstration: React.FC = () => {
  const { t } = useLanguage();
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(42); // start near clip 2
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSafeMargins, setShowSafeMargins] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<'16-9' | '9-16' | '239-1'>('16-9');
  const [selectedClipId, setSelectedClipId] = useState<string>('clip-v1-2');

  const animationFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const rulerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Compute active clip based on playhead position
  const activeClip =
    CLIPS.find((c) => currentTimeSec >= c.startSec && currentTimeSec < c.endSec) || CLIPS[CLIPS.length - 1];

  // Format time in SMPTE: HH:MM:SS:FF (at 24fps)
  const formatSMPTE = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = Math.floor(totalSec % 60);
    const frames = Math.floor((totalSec % 1) * 24);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(mins)}:${pad(secs)}:${pad(frames)}`;
  };

  // Playback loop via requestAnimationFrame
  const updatePlayback = useCallback(
    (timestamp: number) => {
      if (lastTimestampRef.current !== null) {
        const deltaSec = (timestamp - lastTimestampRef.current) / 1000;
        setCurrentTimeSec((prev) => {
          const next = prev + deltaSec * playbackSpeed;
          if (next >= TOTAL_DURATION_SEC) {
            return 0; // loop
          }
          return next;
        });
      }
      lastTimestampRef.current = timestamp;
      animationFrameRef.current = requestAnimationFrame(updatePlayback);
    },
    [playbackSpeed]
  );

  useEffect(() => {
    if (isPlaying) {
      lastTimestampRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(updatePlayback);
    } else {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      lastTimestampRef.current = null;
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, updatePlayback]);

  // Keyboard shortcut listener (Spacebar for play/pause, Left/Right arrows for scrub)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTimeSec((prev) => Math.max(0, prev - (e.shiftKey ? 5 : 1)));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTimeSec((prev) => Math.min(TOTAL_DURATION_SEC, prev + (e.shiftKey ? 5 : 1)));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scrubbing calculation from clientX
  const handleScrubAt = (clientX: number) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCurrentTimeSec(ratio * TOTAL_DURATION_SEC);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleScrubAt(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      handleScrubAt(e.clientX);
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

  const progressPercent = (currentTimeSec / TOTAL_DURATION_SEC) * 100;

  return (
    <section id="timeline-demo" className="home-section" aria-label="Interactive Editing Timeline Demonstration">
      <div className="section-header">
        <div className="section-badge">
          <Film size={14} />
          <span>Interactive NLE Engine Preview</span>
        </div>
        <h2 className="section-title">{t.home.timelineTitle}</h2>
        <p className="section-subtitle">{t.home.timelineSubtitle}</p>
      </div>

      <div className="timeline-demo-box">
        {/* Header Bar */}
        <div className="timeline-demo-header">
          <div className="monitor-status-left">
            <div className="traffic-lights" aria-hidden="true">
              <span className="traffic-light traffic-red" />
              <span className="traffic-light traffic-yellow" />
              <span className="traffic-light traffic-green" />
            </div>
            <span className="timeline-demo-title">
              PIXEL MONITOR 01 // 4K BROADCAST CANVAS
            </span>
          </div>

          <div className="monitor-status-right">
            {/* Aspect Ratio Selector */}
            <div style={{ display: 'flex', gap: 4, background: '#181d2f', padding: 2, borderRadius: 6 }}>
              <button
                onClick={() => setAspectRatio('16-9')}
                className={`transport-btn ${aspectRatio === '16-9' ? 'active' : ''}`}
                style={{ width: 'auto', padding: '0 8px', height: 26, fontSize: 11 }}
                title="16:9 Cinematic Widescreen"
              >
                16:9
              </button>
              <button
                onClick={() => setAspectRatio('9-16')}
                className={`transport-btn ${aspectRatio === '9-16' ? 'active' : ''}`}
                style={{ width: 'auto', padding: '0 8px', height: 26, fontSize: 11 }}
                title="9:16 Vertical Reel"
              >
                9:16
              </button>
              <button
                onClick={() => setAspectRatio('239-1')}
                className={`transport-btn ${aspectRatio === '239-1' ? 'active' : ''}`}
                style={{ width: 'auto', padding: '0 8px', height: 26, fontSize: 11 }}
                title="2.39:1 Anamorphic Scope"
              >
                2.39:1
              </button>
            </div>

            {/* Safe Margins Toggle */}
            <button
              onClick={() => setShowSafeMargins((prev) => !prev)}
              className={`transport-btn ${showSafeMargins ? 'active' : ''}`}
              style={{ width: 30, height: 26 }}
              title={showSafeMargins ? 'Hide Safe Margins' : 'Show Safe Margins'}
              aria-label="Toggle safe margins"
            >
              <Grid size={13} />
            </button>

            {/* Live SMPTE Timecode Counter */}
            <div className="smpte-display" aria-label="Current SMPTE Timecode">
              {formatSMPTE(currentTimeSec)}
            </div>
          </div>
        </div>

        {/* Preview Monitor Screen */}
        <div
          className="monitor-viewport"
          style={{
            aspectRatio:
              aspectRatio === '9-16' ? '9 / 16' : aspectRatio === '239-1' ? '2.39 / 1' : '16 / 9',
            maxHeight: aspectRatio === '9-16' ? 560 : 480,
          }}
        >
          {/* Active Cinematic Still */}
          <img
            src={activeClip.footageUrl}
            alt={activeClip.name}
            className="monitor-footage-img"
          />

          {/* Safe Margins Overlay */}
          {showSafeMargins && (
            <div className="safe-margins-overlay" aria-hidden="true">
              <div className="safe-margin-action" title="90% Action Safe Zone" />
              <div className="safe-margin-title" title="80% Title Safe Zone" />
              <div className="safe-crosshair" />
            </div>
          )}

          {/* Top-Left Codec Badge */}
          <div className="monitor-badge-top-left">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isPlaying ? '#10b981' : '#f59e0b',
                display: 'inline-block',
              }}
            />
            <span>{activeClip.codec}</span>
            <span>•</span>
            <span>{activeClip.resolution}</span>
          </div>

          {/* Top-Right State Badge */}
          <div className="monitor-badge-top-right">
            <span>{isPlaying ? 'PLAYING (24fps)' : 'PAUSED (SCRUB READY)'}</span>
          </div>

          {/* Bottom-Left Clip Detail Box */}
          <div className="monitor-clip-info">
            <div style={{ fontWeight: 700, fontSize: 13, color: '#f8fafc' }}>
              {activeClip.name}
            </div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>{activeClip.tag}</div>
          </div>
        </div>

        {/* Transport Controls Toolbar */}
        <div className="transport-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Speed Multiplier */}
            <div style={{ display: 'flex', gap: 2, background: '#161a29', padding: 2, borderRadius: 6 }}>
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`transport-btn ${playbackSpeed === spd ? 'active' : ''}`}
                  style={{ width: 'auto', padding: '0 8px', height: 28, fontSize: 11 }}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <span style={{ fontSize: 11, color: '#64748b' }}>
              Press <strong>[Space]</strong> to Play/Pause • <strong>[←/→]</strong> to Scrub
            </span>
          </div>

          {/* Main Transport Buttons */}
          <div className="transport-controls-center">
            <button
              onClick={() => setCurrentTimeSec(0)}
              className="transport-btn"
              title="Jump to Start"
              aria-label="Jump to Start"
            >
              <SkipBack size={15} />
            </button>

            <button
              onClick={() => setCurrentTimeSec((prev) => Math.max(0, prev - 1))}
              className="transport-btn"
              title="Step Back 1s"
              aria-label="Step Back"
            >
              <span style={{ fontSize: 11, fontWeight: 700 }}>-1s</span>
            </button>

            <button
              onClick={() => setIsPlaying((prev) => !prev)}
              className="transport-btn primary"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={20} fill="#ffffff" /> : <Play size={20} fill="#ffffff" />}
            </button>

            <button
              onClick={() => setCurrentTimeSec((prev) => Math.min(TOTAL_DURATION_SEC, prev + 1))}
              className="transport-btn"
              title="Step Forward 1s"
              aria-label="Step Forward"
            >
              <span style={{ fontSize: 11, fontWeight: 700 }}>+1s</span>
            </button>

            <button
              onClick={() => setCurrentTimeSec(TOTAL_DURATION_SEC)}
              className="transport-btn"
              title="Jump to End"
              aria-label="Jump to End"
            >
              <SkipForward size={15} />
            </button>
          </div>

          {/* Audio Waveform Meter & Mute */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className={`transport-btn ${isMuted ? 'active' : ''}`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              aria-label="Toggle Mute"
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            <div className="audio-meter-bar" title="Simulated Master Peak Output (-14 LUFS)">
              <span style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace' }}>L</span>
              <div className="meter-track">
                <div
                  className="meter-level"
                  style={{
                    width: isMuted ? '0%' : isPlaying ? `${50 + (Math.sin(currentTimeSec * 8) * 35)}%` : '15%',
                  }}
                />
              </div>
              <span style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace' }}>R</span>
              <div className="meter-track">
                <div
                  className="meter-level"
                  style={{
                    width: isMuted ? '0%' : isPlaying ? `${55 + (Math.cos(currentTimeSec * 7) * 30)}%` : '15%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Multitrack Timeline Area */}
        <div className="timeline-tracks-area">
          {/* Time Ruler & Clickable/Draggable Scrub Bar */}
          <div
            ref={rulerRef}
            className="timeline-ruler"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            title="Click or drag anywhere to scrub timeline"
            aria-label="Timeline Ruler Scrubber"
          >
            <div className="ruler-marks">
              <span className="ruler-mark-item">00:00:00</span>
              <span className="ruler-mark-item">00:00:30</span>
              <span className="ruler-mark-item">00:01:00</span>
              <span className="ruler-mark-item">00:01:30</span>
              <span className="ruler-mark-item">00:02:00</span>
              <span className="ruler-mark-item">00:02:30</span>
              <span className="ruler-mark-item">00:02:45</span>
            </div>

            {/* Red Playhead Laser Line */}
            <div
              className="playhead-scrubber"
              style={{ left: `${progressPercent}%`, height: 260 }}
              aria-hidden="true"
            >
              <div className="playhead-head" />
            </div>
          </div>

          {/* Multitrack Stack */}
          <div className="timeline-tracks-stack">
            {/* Track V2: Adjustment Layer (ACES Grade) */}
            <div className="track-row">
              <div className="track-header-badge" style={{ color: '#c084fc' }}>
                V2 • LUT
              </div>
              <div className="track-lane-content">
                <div
                  className="timeline-clip clip-color-v2"
                  style={{ left: '0%', width: '100%' }}
                  onClick={() => setSelectedClipId('clip-v2')}
                  title="Global Adjustment Layer: ACEScc Kodak 2383 65x65 3D LUT"
                >
                  <Sparkles size={13} />
                  <span>ACEScc_Film_Emulation_Master_Grade_65x.cube [100% Opacity]</span>
                </div>
              </div>
            </div>

            {/* Track V1: Primary Storyboard Footage Cuts */}
            <div className="track-row">
              <div className="track-header-badge" style={{ color: '#818cf8' }}>
                V1 • CUTS
              </div>
              <div className="track-lane-content">
                {CLIPS.map((clip) => {
                  const leftPct = (clip.startSec / TOTAL_DURATION_SEC) * 100;
                  const widthPct = ((clip.endSec - clip.startSec) / TOTAL_DURATION_SEC) * 100;
                  const isCurrent = activeClip.id === clip.id || selectedClipId === clip.id;

                  return (
                    <div
                      key={clip.id}
                      className={`timeline-clip ${clip.colorClass} ${isCurrent ? 'active' : ''}`}
                      style={{
                        left: `${leftPct}%`,
                        width: `calc(${widthPct}% - 4px)`,
                      }}
                      onClick={() => {
                        setCurrentTimeSec(clip.startSec + 0.1);
                        setSelectedClipId(clip.id);
                      }}
                      title={`Click to jump to ${clip.name}`}
                    >
                      <Film size={13} />
                      <span>{clip.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Track GFX: Kinetic Lower Thirds & 3D Logo Reveal */}
            <div className="track-row">
              <div className="track-header-badge" style={{ color: '#fb923c' }}>
                GFX • 3D
              </div>
              <div className="track-lane-content">
                <div
                  className="timeline-clip clip-color-gfx"
                  style={{ left: '25%', width: '35%' }}
                  onClick={() => setSelectedClipId('clip-gfx')}
                  title="Kinetic Lower Thirds & Holographic Brand Callout"
                >
                  <Layers size={13} />
                  <span>Kinetic_3D_Reveal_Overlay.lottie [Alpha Pass]</span>
                </div>
              </div>
            </div>

            {/* Track A1: Dialogue & Vocal Stems */}
            <div className="track-row">
              <div className="track-header-badge" style={{ color: '#34d399' }}>
                A1 • VOX
              </div>
              <div className="track-lane-content">
                <div
                  className="timeline-clip clip-color-a1"
                  style={{ left: '5%', width: '88%' }}
                  onClick={() => setSelectedClipId('clip-a1')}
                  title="Master Voiceover & Commercial Dialogue (De-noised & Equalized)"
                >
                  <Music size={13} />
                  <span>Voiceover_Narrator_Master_Stem_96kHz.wav [-14 LUFS]</span>
                  <div className="clip-waveform" aria-hidden="true">
                    {[12, 16, 8, 20, 14, 10, 22, 18, 12, 24, 15, 8, 20, 14].map((h, i) => (
                      <div key={i} className="waveform-bar" style={{ height: h }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Track A2: Orchestral Score & Sub Bass */}
            <div className="track-row">
              <div className="track-header-badge" style={{ color: '#2dd4bf' }}>
                A2 • OST
              </div>
              <div className="track-lane-content">
                <div
                  className="timeline-clip clip-color-a2"
                  style={{ left: '0%', width: '100%' }}
                  onClick={() => setSelectedClipId('clip-a2')}
                  title="Original Score & Hybrid Sound Effects"
                >
                  <Music size={13} />
                  <span>Cinematic_Anthem_Score_5.1_Surround.wav</span>
                  <div className="clip-waveform" aria-hidden="true">
                    {[6, 10, 14, 18, 22, 16, 12, 18, 24, 20, 14, 18, 22, 10].map((h, i) => (
                      <div key={i} className="waveform-bar" style={{ height: h }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phase 1 Demonstration Notice */}
        <div
          style={{
            padding: '12px 20px',
            background: '#090b12',
            borderTop: '1px solid #1a1f30',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 12,
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={15} color="#818cf8" />
            <span>
              <strong>Phase 1 Demonstration Engine:</strong> Real play/pause, scrub, and clip synchronization. Full multitrack cut/snip/export engine arriving in Phase 2.
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
            FRAME: {Math.floor((currentTimeSec % 1) * 24)} / 24 • SMPTE 24.00 FPS
          </span>
        </div>
      </div>
    </section>
  );
};
