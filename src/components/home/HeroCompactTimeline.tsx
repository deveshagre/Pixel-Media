import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Scissors,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEditor } from '../../editor/context/EditorContext';
import { framesToTimecode } from '../../editor/utils/timecode';
import { TimelineClip } from '../../editor/types';

export const HeroCompactTimeline: React.FC = () => {
  const {
    project,
    currentFrame,
    isPlaying,
    selectedClipId,
    zoomLevel,
    setZoomLevel,
    togglePlay,
    seekToFrame,
    stepFrame,
    jumpToStart,
    jumpToEnd,
    selectClip,
    splitClipAtPlayhead,
    moveClip,
    trimClip,
    toggleTrackVisibility,
    toggleTrackLock,
    toggleTrackMute,
  } = useEditor();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const lanesRef = useRef<HTMLDivElement | null>(null);

  // Drag state for clip movement or trimming
  const clipDragState = useRef<{
    clipId: string;
    mode: 'move' | 'trim-start' | 'trim-end';
    startClientX: number;
    initialStartFrame: number;
    initialDuration: number;
  } | null>(null);

  // Playhead scrubbing state
  const isScrubbing = useRef(false);

  const fps = project.fps || 30;
  const pxPerFrame = 2.0 * zoomLevel;
  const totalWidthPx = project.durationFrames * pxPerFrame;
  const playheadLeftPx = currentFrame * pxPerFrame;

  // Spacebar hotkey for playback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(-1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepFrame(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepFrame]);

  // Handle global mouse move & up for scrubbing and clip dragging
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isScrubbing.current && lanesRef.current) {
        const rect = lanesRef.current.getBoundingClientRect();
        const scrollLeft = lanesRef.current.scrollLeft;
        const clickX = e.clientX - rect.left + scrollLeft;
        const targetFrame = Math.max(0, Math.min(project.durationFrames - 1, Math.round(clickX / pxPerFrame)));
        seekToFrame(targetFrame);
      } else if (clipDragState.current) {
        const { clipId, mode, startClientX, initialStartFrame, initialDuration } = clipDragState.current;
        const deltaFrames = Math.round((e.clientX - startClientX) / pxPerFrame);

        if (mode === 'move') {
          const newStart = Math.max(0, Math.min(project.durationFrames - initialDuration, initialStartFrame + deltaFrames));
          moveClip(clipId, newStart, undefined, true);
        } else if (mode === 'trim-start') {
          const newStart = Math.max(0, Math.min(initialStartFrame + initialDuration - 5, initialStartFrame + deltaFrames));
          trimClip(clipId, 'start', newStart);
        } else if (mode === 'trim-end') {
          const newEnd = Math.max(initialStartFrame + 5, initialStartFrame + initialDuration + deltaFrames);
          trimClip(clipId, 'end', newEnd);
        }
      }
    };

    const handleWindowMouseUp = () => {
      isScrubbing.current = false;
      clipDragState.current = null;
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [pxPerFrame, project.durationFrames, seekToFrame, moveClip, trimClip]);

  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isScrubbing.current = true;
    if (lanesRef.current) {
      const rect = lanesRef.current.getBoundingClientRect();
      const scrollLeft = lanesRef.current.scrollLeft;
      const clickX = e.clientX - rect.left + scrollLeft;
      const targetFrame = Math.max(0, Math.min(project.durationFrames - 1, Math.round(clickX / pxPerFrame)));
      seekToFrame(targetFrame);
    }
  };

  const handleClipMouseDown = (e: React.MouseEvent, clip: TimelineClip, mode: 'move' | 'trim-start' | 'trim-end') => {
    e.stopPropagation();
    selectClip(clip.id);
    clipDragState.current = {
      clipId: clip.id,
      mode,
      startClientX: e.clientX,
      initialStartFrame: clip.startFrame,
      initialDuration: clip.durationFrames,
    };
  };

  const timecodeCurrent = framesToTimecode(currentFrame, fps);
  const timecodeTotal = framesToTimecode(project.durationFrames, fps);

  // Generate ruler tick markers
  const secondInterval = zoomLevel < 0.6 ? 5 : zoomLevel < 1.2 ? 2 : 1;
  const totalSeconds = Math.ceil(project.durationFrames / fps);
  const ticks: { frame: number; sec: number; leftPx: number }[] = [];
  for (let s = 0; s <= totalSeconds; s += secondInterval) {
    ticks.push({
      sec: s,
      frame: s * fps,
      leftPx: s * fps * pxPerFrame,
    });
  }

  return (
    <div className="hero-timeline-card" role="region" aria-label="Interactive Multitrack Timeline">
      {/* Timeline Control Header */}
      <div className="timeline-ctrl-bar">
        {/* Playback Transport Buttons */}
        <div className="transport-btn-group">
          <button onClick={jumpToStart} className="transport-btn" title="Jump to start (Home)">
            <SkipBack size={14} />
          </button>
          <button onClick={() => stepFrame(-1)} className="transport-btn" title="Step back 1 frame (Left Arrow)">
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={togglePlay}
            className={`transport-play-btn ${isPlaying ? 'playing' : ''}`}
            title="Play / Pause (Space)"
            aria-label={isPlaying ? 'Pause Sequence' : 'Play Sequence'}
          >
            {isPlaying ? <Pause size={15} fill="#ffffff" /> : <Play size={15} fill="#ffffff" style={{ marginLeft: 2 }} />}
          </button>
          <button onClick={() => stepFrame(1)} className="transport-btn" title="Step forward 1 frame (Right Arrow)">
            <ChevronRight size={14} />
          </button>
          <button onClick={jumpToEnd} className="transport-btn" title="Jump to end (End)">
            <SkipForward size={14} />
          </button>
        </div>

        {/* Timecode Readout */}
        <div className="timeline-timecode-box">
          <span className="current-tc">{timecodeCurrent}</span>
          <span className="tc-divider">/</span>
          <span className="total-tc">{timecodeTotal}</span>
        </div>

        {/* Tools: Razor / Split, Zoom */}
        <div className="timeline-actions-group">
          <button
            onClick={() => splitClipAtPlayhead()}
            className="timeline-tool-btn"
            title="Split selected clip at playhead"
          >
            <Scissors size={13} />
            <span>Split</span>
          </button>

          <div className="zoom-controls">
            <button
              onClick={() => setZoomLevel(Math.max(0.4, zoomLevel - 0.2))}
              className="zoom-btn"
              title="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="zoom-label">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.2))}
              className="zoom-btn"
              title="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Collapse / Expand Toggle */}
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="timeline-collapse-btn"
            title={isCollapsed ? 'Expand Timeline' : 'Collapse Timeline'}
          >
            <span>{isCollapsed ? 'Expand Timeline' : 'Collapse'}</span>
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Collapsible Multitrack Body */}
      {!isCollapsed && (
        <div className="timeline-tracks-area">
          {/* Left Column: Track Headers */}
          <div className="track-headers-column">
            <div className="track-header-spacer">Tracks</div>
            {project.tracks.map((track) => (
              <div key={track.id} className="track-header-row">
                <span className="track-name-label">{track.name}</span>
                <div className="track-quick-icons">
                  <button
                    onClick={() => toggleTrackVisibility(track.id)}
                    className={`track-icon-btn ${!track.visible ? 'dim' : ''}`}
                    title={track.visible ? 'Hide track' : 'Show track'}
                  >
                    {track.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button
                    onClick={() => toggleTrackLock(track.id)}
                    className={`track-icon-btn ${track.locked ? 'active' : ''}`}
                    title={track.locked ? 'Unlock track' : 'Lock track'}
                  >
                    {track.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </button>
                  {track.type === 'audio' && (
                    <button
                      onClick={() => toggleTrackMute(track.id)}
                      className={`track-icon-btn ${track.muted ? 'active' : ''}`}
                      title={track.muted ? 'Unmute track' : 'Mute track'}
                    >
                      {track.muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right Scrollable Area: Ruler + Lanes */}
          <div className="track-lanes-scroll" ref={lanesRef}>
            {/* Time Ruler */}
            <div
              className="timeline-ruler"
              style={{ width: `${totalWidthPx}px` }}
              onMouseDown={handleRulerMouseDown}
            >
              {ticks.map((t) => (
                <div key={t.frame} className="ruler-tick" style={{ left: `${t.leftPx}px` }}>
                  <div className="tick-line" />
                  <span className="tick-label">{t.sec}s</span>
                </div>
              ))}
            </div>

            {/* Track Lanes */}
            <div className="timeline-lanes-container" style={{ width: `${totalWidthPx}px` }}>
              {project.tracks.map((track) => {
                const trackClips = project.clips.filter((c) => c.trackId === track.id);
                return (
                  <div key={track.id} className="timeline-lane-row">
                    {trackClips.map((clip) => {
                      const leftPx = clip.startFrame * pxPerFrame;
                      const widthPx = clip.durationFrames * pxPerFrame;
                      const isSelected = selectedClipId === clip.id;
                      const hasKeyframes = Boolean(
                        clip.keyframes && Object.values(clip.keyframes).some((arr) => arr && arr.length > 0)
                      );

                      return (
                        <div
                          key={clip.id}
                          className={`timeline-clip-block clip-${clip.type} ${isSelected ? 'selected' : ''}`}
                          style={{
                            left: `${leftPx}px`,
                            width: `${widthPx}px`,
                          }}
                          onMouseDown={(e) => handleClipMouseDown(e, clip, 'move')}
                        >
                          {/* Left Trim Handle */}
                          <div
                            className="trim-handle trim-left"
                            onMouseDown={(e) => handleClipMouseDown(e, clip, 'trim-start')}
                            title="Trim start"
                          />

                          {/* Clip Body Content */}
                          <div className="clip-content-inner">
                            <span className="clip-title-text">{clip.name}</span>
                            {hasKeyframes && <span className="kf-dot" title="Animated Layer" />}
                          </div>

                          {/* Right Trim Handle */}
                          <div
                            className="trim-handle trim-right"
                            onMouseDown={(e) => handleClipMouseDown(e, clip, 'trim-end')}
                            title="Trim end"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Playhead Needle Line */}
              <div
                className="timeline-playhead-line"
                style={{ left: `${playheadLeftPx}px` }}
              >
                <div className="playhead-marker" />
                <div className="playhead-stem" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
