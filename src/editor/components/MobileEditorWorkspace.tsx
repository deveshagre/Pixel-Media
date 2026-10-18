import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Download,
  Film,
  Scissors,
  Trash2,
  Copy,
  Layers,
  Sliders,
  Plus,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { PreviewCanvas } from './PreviewCanvas';
import { MediaPanel } from './MediaPanel';
import { TitlesPanel } from './TitlesPanel';
import { InspectorPanel } from './InspectorPanel';
import { Timeline } from './Timeline';
import { framesToTimecode } from '../utils/timecode';

interface MobileEditorWorkspaceProps {
  onOpenExportModal: () => void;
}

export const MobileEditorWorkspace: React.FC<MobileEditorWorkspaceProps> = ({
  onOpenExportModal,
}) => {
  const navigate = useNavigate();
  const {
    project,
    currentFrame,
    isPlaying,
    togglePlay,
    stepFrame,
    canUndo,
    canRedo,
    undo,
    redo,
    selectedClipId,
    splitClipAtPlayhead,
    deleteClip,
    duplicateClip,
    seekToFrame,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<'preview' | 'timeline' | 'media' | 'inspector'>('preview');

  const fps = project.fps || 30;

  return (
    <div className="nle-mobile-workspace">
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <button
          onClick={() => navigate('/')}
          className="mobile-header-btn"
          title="Return to Studio Home"
        >
          <ArrowLeft size={16} />
        </button>

        <span className="mobile-title" title={project.name}>
          {project.name}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={undo}
            disabled={!canUndo}
            className="mobile-header-btn"
            title="Undo"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="mobile-header-btn"
            title="Redo"
          >
            <RotateCw size={15} />
          </button>
          <button
            onClick={onOpenExportModal}
            className="mobile-export-btn"
            title="Export Video"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* Main Body depending on active bottom tab */}
      <div className="mobile-content-area">
        {activeTab === 'preview' && (
          <div className="mobile-preview-tab">
            <PreviewCanvas />

            {/* Quick action bar */}
            <div className="mobile-quick-actions">
              <button
                onClick={() => splitClipAtPlayhead(selectedClipId || undefined)}
                className="mobile-action-pill"
                title="Split clip at playhead"
              >
                <Scissors size={14} />
                <span>Split</span>
              </button>

              {selectedClipId && (
                <>
                  <button
                    onClick={() => duplicateClip(selectedClipId)}
                    className="mobile-action-pill"
                    title="Duplicate selected clip"
                  >
                    <Copy size={14} />
                    <span>Duplicate</span>
                  </button>
                  <button
                    onClick={() => deleteClip(selectedClipId)}
                    className="mobile-action-pill danger"
                    title="Delete clip"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>

            {/* Mobile Touch Scrub Wheel */}
            <div className="mobile-touch-scrubber">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f4f4f5' }}>
                  {framesToTimecode(currentFrame, fps)}
                </span>
                <span style={{ fontSize: 12, color: '#71717a' }}>
                  Frame {currentFrame} / {project.durationFrames}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={project.durationFrames - 1}
                value={currentFrame}
                onChange={(e) => seekToFrame(parseInt(e.target.value, 10))}
                className="mobile-scrub-slider"
              />

              <div className="mobile-step-row">
                <button
                  onClick={() => stepFrame(-fps)}
                  className="mobile-step-btn"
                >
                  -1s
                </button>
                <button
                  onClick={() => stepFrame(-1)}
                  className="mobile-step-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={togglePlay}
                  className={`mobile-play-btn ${isPlaying ? 'playing' : ''}`}
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
                </button>
                <button
                  onClick={() => stepFrame(1)}
                  className="mobile-step-btn"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => stepFrame(fps)}
                  className="mobile-step-btn"
                >
                  +1s
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="mobile-timeline-tab">
            <Timeline />
          </div>
        )}

        {activeTab === 'media' && (
          <div className="mobile-panel-tab">
            <MediaPanel />
            <div style={{ marginTop: 20 }}>
              <TitlesPanel />
            </div>
          </div>
        )}

        {activeTab === 'inspector' && (
          <div className="mobile-panel-tab">
            <InspectorPanel />
          </div>
        )}
      </div>

      {/* Bottom Touch Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          onClick={() => setActiveTab('preview')}
          className={`mobile-nav-item ${activeTab === 'preview' ? 'active' : ''}`}
        >
          <Film size={18} />
          <span>Monitor</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`mobile-nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
        >
          <Layers size={18} />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`mobile-nav-item ${activeTab === 'media' ? 'active' : ''}`}
        >
          <Plus size={18} />
          <span>Media</span>
        </button>

        <button
          onClick={() => setActiveTab('inspector')}
          className={`mobile-nav-item ${activeTab === 'inspector' ? 'active' : ''}`}
        >
          <Sliders size={18} />
          <span>Inspect</span>
        </button>
      </nav>
    </div>
  );
};
