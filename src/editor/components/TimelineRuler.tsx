import React, { useRef } from 'react';
import { framesToTimecode } from '../utils/timecode';

interface TimelineRulerProps {
  totalFrames: number;
  fps: number;
  zoomLevel: number; // pixels per frame multiplier
  onSeek: (frame: number) => void;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  totalFrames,
  fps,
  zoomLevel,
  onSeek,
}) => {
  const rulerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic step intervals based on zoom
  const pxPerFrame = 2.5 * zoomLevel;
  let frameStep = 30; // default 1s
  if (pxPerFrame > 5) frameStep = 10;
  if (pxPerFrame > 12) frameStep = 5;
  if (pxPerFrame < 1.2) frameStep = 60;
  if (pxPerFrame < 0.6) frameStep = 150;

  const totalWidth = totalFrames * pxPerFrame;

  const handleRulerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const targetFrame = Math.max(0, Math.min(totalFrames - 1, Math.round(offsetX / pxPerFrame)));
    onSeek(targetFrame);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const moveOffsetX = moveEvent.clientX - rect.left;
      const moveFrame = Math.max(0, Math.min(totalFrames - 1, Math.round(moveOffsetX / pxPerFrame)));
      onSeek(moveFrame);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Generate tick marks
  const ticks: { frame: number; isMajor: boolean; label?: string }[] = [];
  for (let f = 0; f <= totalFrames; f += frameStep) {
    const isMajor = f % (frameStep * 2) === 0;
    ticks.push({
      frame: f,
      isMajor,
      label: isMajor ? framesToTimecode(f, fps).substring(3) : undefined, // MM:SS:FF
    });
  }

  return (
    <div
      ref={rulerRef}
      className="nle-timeline-ruler"
      style={{ width: `${totalWidth}px` }}
      onMouseDown={handleRulerMouseDown}
    >
      {ticks.map((t) => (
        <div
          key={t.frame}
          className={`ruler-tick ${t.isMajor ? 'major' : 'minor'}`}
          style={{ left: `${t.frame * pxPerFrame}px` }}
        >
          {t.label && <span className="ruler-label">{t.label}</span>}
        </div>
      ))}
    </div>
  );
};
