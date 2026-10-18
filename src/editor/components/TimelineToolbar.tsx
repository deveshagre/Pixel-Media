import React, { useState } from 'react';
import {
  MousePointer,
  Scissors,
  Copy,
  Trash2,
  Plus,
  Magnet,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';

export const TimelineToolbar: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    selectedClipId,
    deleteClip,
    duplicateClip,
    splitClipAtPlayhead,
    zoomLevel,
    setZoomLevel,
    addTrack,
  } = useEditor();

  const [trackMenuOpen, setTrackMenuOpen] = useState(false);
  const [snappingActive, setSnappingActive] = useState(true);

  return (
    <div className="nle-timeline-toolbar">
      {/* Editing Tool toggles */}
      <div className="toolbar-group">
        <button
          onClick={() => setActiveTool('select')}
          className={`timeline-tool-btn ${activeTool === 'select' ? 'active' : ''}`}
          title="Selection Tool (V)"
        >
          <MousePointer size={14} />
          <span>Select</span>
        </button>

        <button
          onClick={() => setActiveTool('razor')}
          className={`timeline-tool-btn ${activeTool === 'razor' ? 'active' : ''}`}
          title="Razor Blade Tool (C) - Click any clip to cut"
        >
          <Scissors size={14} />
          <span>Razor</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Clip Actions */}
      <div className="toolbar-group">
        <button
          onClick={() => splitClipAtPlayhead(selectedClipId || undefined)}
          className="timeline-action-btn"
          title="Split clip at current playhead (S)"
        >
          <Scissors size={13} />
          <span>Split at Playhead</span>
        </button>

        <button
          onClick={() => selectedClipId && duplicateClip(selectedClipId)}
          disabled={!selectedClipId}
          className="timeline-action-btn"
          title="Duplicate selected clip"
        >
          <Copy size={13} />
          <span>Duplicate</span>
        </button>

        <button
          onClick={() => selectedClipId && deleteClip(selectedClipId)}
          disabled={!selectedClipId}
          className="timeline-action-btn danger"
          title="Delete selected clip (Delete / Backspace)"
        >
          <Trash2 size={13} />
          <span>Delete</span>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Add Track */}
      <div className="toolbar-group" style={{ position: 'relative' }}>
        <button
          onClick={() => setTrackMenuOpen((prev) => !prev)}
          className="timeline-action-btn"
          title="Add a new timeline track"
        >
          <Plus size={13} />
          <span>Add Track</span>
        </button>

        {trackMenuOpen && (
          <div className="track-menu-dropdown">
            <button
              onClick={() => {
                addTrack('video');
                setTrackMenuOpen(false);
              }}
            >
              + Video Track (V)
            </button>
            <button
              onClick={() => {
                addTrack('text');
                setTrackMenuOpen(false);
              }}
            >
              + Title Track (T)
            </button>
            <button
              onClick={() => {
                addTrack('audio');
                setTrackMenuOpen(false);
              }}
            >
              + Audio Track (A)
            </button>
          </div>
        )}
      </div>

      {/* Right: Snapping & Timeline Zoom */}
      <div className="toolbar-group-right">
        <button
          onClick={() => setSnappingActive((prev) => !prev)}
          className={`timeline-icon-btn ${snappingActive ? 'active' : ''}`}
          title={snappingActive ? 'Magnetic Snapping: Enabled' : 'Magnetic Snapping: Disabled'}
        >
          <Magnet size={14} />
        </button>

        <div className="zoom-control-box">
          <button
            onClick={() => setZoomLevel(Math.max(0.3, zoomLevel - 0.2))}
            className="zoom-btn"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>

          <input
            type="range"
            min="0.3"
            max="3.0"
            step="0.1"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
            className="zoom-slider"
            title="Timeline Zoom Level"
          />

          <button
            onClick={() => setZoomLevel(Math.min(3.0, zoomLevel + 0.2))}
            className="zoom-btn"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
