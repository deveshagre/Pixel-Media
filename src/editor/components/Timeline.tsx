import React, { useRef } from 'react';
import { useEditor } from '../context/EditorContext';
import { TimelineToolbar } from './TimelineToolbar';
import { TimelineRuler } from './TimelineRuler';
import { TimelineTrackHeader } from './TimelineTrackHeader';
import { TimelineClipView } from './TimelineClipView';

export const Timeline: React.FC = () => {
  const {
    project,
    currentFrame,
    selectedClipId,
    zoomLevel,
    seekToFrame,
    selectClip,
  } = useEditor();

  const tracksScrollRef = useRef<HTMLDivElement | null>(null);

  const fps = project.fps || 30;
  const pxPerFrame = 2.5 * zoomLevel;
  const totalWidthPx = project.durationFrames * pxPerFrame;
  const playheadLeftPx = currentFrame * pxPerFrame;

  // Clicking on timeline background deselects clip and seeks playhead
  const handleTimelineLaneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tracksScrollRef.current) return;
    const rect = tracksScrollRef.current.getBoundingClientRect();
    const scrollLeft = tracksScrollRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const targetFrame = Math.max(0, Math.min(project.durationFrames - 1, Math.round(clickX / pxPerFrame)));
    seekToFrame(targetFrame);
    selectClip(null);
  };

  return (
    <div className="nle-timeline-container" role="region" aria-label="Timeline Editor">
      {/* Timeline Controls & Actions */}
      <TimelineToolbar />

      {/* Main Track Workspace */}
      <div className="nle-timeline-body">
        {/* Left Column: Fixed Track Headers */}
        <div className="nle-headers-column">
          <div className="headers-ruler-spacer" />
          <div className="headers-list">
            {project.tracks.map((track) => (
              <TimelineTrackHeader key={track.id} track={track} />
            ))}
          </div>
        </div>

        {/* Right Area: Scrollable Ruler & Lanes */}
        <div className="nle-lanes-scroll-wrapper" ref={tracksScrollRef} onClick={handleTimelineLaneClick}>
          {/* Ruler */}
          <TimelineRuler
            totalFrames={project.durationFrames}
            fps={fps}
            zoomLevel={zoomLevel}
            onSeek={seekToFrame}
          />

          {/* Track Lanes */}
          <div className="nle-tracks-lanes" style={{ width: `${totalWidthPx}px` }}>
            {project.tracks.map((track) => {
              const trackClips = project.clips.filter((c) => c.trackId === track.id);
              return (
                <div key={track.id} className={`nle-track-lane ${track.locked ? 'locked' : ''}`}>
                  {trackClips.map((clip) => (
                    <TimelineClipView
                      key={clip.id}
                      clip={clip}
                      isSelected={selectedClipId === clip.id}
                      pxPerFrame={pxPerFrame}
                      fps={fps}
                    />
                  ))}
                </div>
              );
            })}

            {/* Playhead Needle Line & Top Cap */}
            <div
              className="nle-playhead-needle"
              style={{
                left: `${playheadLeftPx}px`,
              }}
            >
              <div className="playhead-cap" />
              <div className="playhead-shaft" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
