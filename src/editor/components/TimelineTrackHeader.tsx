import React from 'react';
import { Eye, EyeOff, Lock, Unlock, Volume2, VolumeX } from 'lucide-react';
import { TimelineTrack } from '../types';
import { useEditor } from '../context/EditorContext';

interface TimelineTrackHeaderProps {
  track: TimelineTrack;
}

export const TimelineTrackHeader: React.FC<TimelineTrackHeaderProps> = ({ track }) => {
  const { toggleTrackVisibility, toggleTrackLock, toggleTrackMute } = useEditor();

  return (
    <div className="nle-track-header">
      <div className="track-title-row">
        <span className={`track-badge badge-${track.type}`}>
          {track.type.toUpperCase().substring(0, 3)}
        </span>
        <span className="track-name" title={track.name}>
          {track.name}
        </span>
      </div>

      <div className="track-controls">
        {/* Visibility */}
        <button
          onClick={() => toggleTrackVisibility(track.id)}
          className={`track-ctrl-btn ${!track.visible ? 'active-mute' : ''}`}
          title={track.visible ? 'Hide Track' : 'Show Track'}
        >
          {track.visible ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>

        {/* Lock */}
        <button
          onClick={() => toggleTrackLock(track.id)}
          className={`track-ctrl-btn ${track.locked ? 'active-lock' : ''}`}
          title={track.locked ? 'Unlock Track' : 'Lock Track'}
        >
          {track.locked ? <Lock size={13} /> : <Unlock size={13} />}
        </button>

        {/* Mute (for audio/video tracks) */}
        {(track.type === 'audio' || track.type === 'video') && (
          <button
            onClick={() => toggleTrackMute(track.id)}
            className={`track-ctrl-btn ${track.muted ? 'active-mute' : ''}`}
            title={track.muted ? 'Unmute Track' : 'Mute Track'}
          >
            {track.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        )}
      </div>
    </div>
  );
};
