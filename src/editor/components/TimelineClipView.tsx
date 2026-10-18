import React, { useRef, useState } from 'react';
import { Film, Music, Type, Square } from 'lucide-react';
import { TimelineClip } from '../types';
import { useEditor } from '../context/EditorContext';
import { formatTimeDisplay } from '../utils/timecode';

interface TimelineClipViewProps {
  clip: TimelineClip;
  isSelected: boolean;
  pxPerFrame: number;
  fps: number;
}

export const TimelineClipView: React.FC<TimelineClipViewProps> = ({
  clip,
  isSelected,
  pxPerFrame,
  fps,
}) => {
  const {
    selectClip,
    moveClip,
    trimClip,
    activeTool,
    splitClipAtPlayhead,
  } = useEditor();

  const clipRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimming, setIsTrimming] = useState<'start' | 'end' | null>(null);

  const leftPx = clip.startFrame * pxPerFrame;
  const widthPx = Math.max(18, clip.durationFrames * pxPerFrame);

  // Type styling
  let clipTypeClass = 'clip-video';
  let Icon = Film;
  if (clip.type === 'audio') {
    clipTypeClass = 'clip-audio';
    Icon = Music;
  } else if (clip.type === 'text') {
    clipTypeClass = 'clip-text';
    Icon = Type;
  } else if (clip.type === 'shape') {
    clipTypeClass = 'clip-shape';
    Icon = Square;
  }

  // Handle click / Razor tool
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTool === 'razor') {
      splitClipAtPlayhead(clip.id);
    } else {
      selectClip(clip.id);
    }
  };

  // Drag moving clip along time axis
  const handleDragStart = (e: React.MouseEvent) => {
    if (activeTool === 'razor') return;
    e.stopPropagation();
    selectClip(clip.id);
    setIsDragging(true);

    const startClientX = e.clientX;
    const initialStartFrame = clip.startFrame;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startClientX;
      const deltaFrames = Math.round(deltaPx / pxPerFrame);
      const newStartFrame = Math.max(0, initialStartFrame + deltaFrames);
      moveClip(clip.id, newStartFrame, undefined, true);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Trimming handles
  const handleTrimStart = (e: React.MouseEvent, edge: 'start' | 'end') => {
    e.stopPropagation();
    selectClip(clip.id);
    setIsTrimming(edge);

    const startClientX = e.clientX;
    const initialFrame = edge === 'start' ? clip.startFrame : clip.startFrame + clip.durationFrames;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startClientX;
      const deltaFrames = Math.round(deltaPx / pxPerFrame);
      const targetFrame = initialFrame + deltaFrames;
      trimClip(clip.id, edge, targetFrame);
    };

    const handleMouseUp = () => {
      setIsTrimming(null);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={clipRef}
      className={`nle-timeline-clip ${clipTypeClass} ${isSelected ? 'selected' : ''} ${
        isDragging ? 'dragging' : ''
      } ${isTrimming ? 'trimming' : ''}`}
      style={{
        left: `${leftPx}px`,
        width: `${widthPx}px`,
      }}
      onClick={handleClick}
      onMouseDown={handleDragStart}
    >
      {/* Left Trim Handle */}
      <div
        className="clip-trim-handle left"
        onMouseDown={(e) => handleTrimStart(e, 'start')}
        title="Drag to trim start (head)"
      >
        <div className="handle-bar" />
      </div>

      {/* Clip Content & Label */}
      <div className="clip-content">
        <Icon size={12} className="clip-icon" />
        <span className="clip-name" title={clip.name}>
          {clip.name}
        </span>
        {widthPx > 80 && (
          <span className="clip-duration">
            {formatTimeDisplay(clip.durationFrames, fps)}
          </span>
        )}
      </div>

      {/* Simulated Audio Waveform for audio clips */}
      {clip.type === 'audio' && widthPx > 40 && (
        <div className="clip-waveform-bars">
          {Array.from({ length: Math.min(30, Math.floor(widthPx / 6)) }).map((_, i) => (
            <span
              key={i}
              className="waveform-bar"
              style={{
                height: `${20 + Math.sin(i * 1.3) * 15 + Math.cos(i * 0.7) * 20}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Keyframe indicators on clip */}
      {clip.keyframes && Object.keys(clip.keyframes).length > 0 && widthPx > 60 && (
        <div className="clip-keyframe-dots">
          <span className="kf-dot" title="Contains animated keyframes" />
        </div>
      )}

      {/* Right Trim Handle */}
      <div
        className="clip-trim-handle right"
        onMouseDown={(e) => handleTrimStart(e, 'end')}
        title="Drag to trim end (tail)"
      >
        <div className="handle-bar" />
      </div>
    </div>
  );
};
