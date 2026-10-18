import React, { useState } from 'react';
import {
  Play,
  Pause,
  ArrowDown,
  ArrowUpRight,
  Download,
  RotateCcw,
  RotateCw,
  Check,
} from 'lucide-react';
import { useEditor } from '../../editor/context/EditorContext';
import { HeroCanvasWorkspace } from './HeroCanvasWorkspace';
import { HeroContextualToolbar } from './HeroContextualToolbar';
import { HeroFootageTray } from './HeroFootageTray';
import { HeroCompactTimeline } from './HeroCompactTimeline';
import { ExportModal } from '../../editor/components/ExportModal';

interface HeroSectionProps {
  onStartProject: () => void;
  onExploreWork: () => void;
}

interface ShowreelPreset {
  id: string;
  category: string;
  assetId: string;
  name: string;
  imageUrl: string;
  headline: string;
  subtitle: string;
}

const PRESET_SCENES: ShowreelPreset[] = [
  {
    id: 'scene-1',
    category: 'Commercial Film',
    assetId: 'asset-sample-cyber',
    name: 'Horizon Automotive — Broadcast Sequence',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
    headline: 'Make every frame count.',
    subtitle: 'Thoughtful editing, striking visuals, and motion that brings your ideas to life.',
  },
  {
    id: 'scene-2',
    category: 'Beauty & Retouching',
    assetId: 'asset-sample-urban',
    name: 'Luminary Autumn — Editorial Master',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85',
    headline: 'Elegance in every pixel.',
    subtitle: 'Precision color grading, high-end skin texture retouching, and cinematic pacing.',
  },
  {
    id: 'scene-3',
    category: 'Esports Highlights',
    assetId: 'asset-esports-showreel',
    name: 'VCT Championship — Esports Finals Reel',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
    headline: 'Kinetic energy at 240 FPS.',
    subtitle: 'High-impact gameplay sequencing, audio sync, sound design, and custom 3D motion.',
  },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartProject,
  onExploreWork,
}) => {
  const {
    project,
    isPlaying,
    togglePlay,
    selectedClipId,
    selectClip,
    updateClip,
    undo,
    redo,
    canUndo,
    canRedo,
    saveStatus,
  } = useEditor();

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [editingHeadlineInline, setEditingHeadlineInline] = useState(false);
  const [editingSubtitleInline, setEditingSubtitleInline] = useState(false);

  // Retrieve headline and subtitle clips from project
  const headlineClip = project.clips.find((c) => c.id === 'clip-hero-headline');
  const subtitleClip = project.clips.find((c) => c.id === 'clip-hero-subtitle');

  const headlineText = headlineClip?.textConfig?.text || 'Make every frame count.';
  const subtitleText =
    subtitleClip?.textConfig?.text ||
    'Thoughtful editing, striking visuals, and motion that brings your ideas to life.';

  // Switch showreel preset scene
  const handleSelectScene = (index: number) => {
    setActiveSceneIndex(index);
    const preset = PRESET_SCENES[index];
    if (!preset) return;

    // Update media clip
    const mediaClip = project.clips.find((c) => c.id === 'clip-hero-media');
    if (mediaClip) {
      updateClip(mediaClip.id, {
        assetId: preset.assetId,
        name: preset.name,
      });
    }

    // Update headline clip text
    if (headlineClip) {
      updateClip(headlineClip.id, {
        textConfig: {
          ...headlineClip.textConfig!,
          text: preset.headline,
        },
      });
    }

    // Update subtitle clip text
    if (subtitleClip) {
      updateClip(subtitleClip.id, {
        textConfig: {
          ...subtitleClip.textConfig!,
          text: preset.subtitle,
        },
      });
    }
  };

  return (
    <section className="studio-section hero-editor-section" style={{ paddingTop: 40, paddingBottom: 80 }} aria-label="Hero">
      <div className="studio-container">
        {/* Editorial Text Layer Area: Interactive & Editable */}
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className="editorial-label">Interactive Creative Studio</span>
            <div className="hero-autosave-badge">
              <Check size={11} className="text-amber" />
              <span>{saveStatus === 'saved' ? 'Project Saved' : 'Saving...'}</span>
            </div>
          </div>

          {/* Interactive Headline */}
          <div
            className={`hero-headline-wrapper ${selectedClipId === 'clip-hero-headline' ? 'is-selected' : ''}`}
            onClick={() => selectClip('clip-hero-headline')}
            title="Click to edit headline text and typography"
          >
            {editingHeadlineInline ? (
              <input
                type="text"
                autoFocus
                value={headlineText}
                onChange={(e) => {
                  if (headlineClip && headlineClip.textConfig) {
                    updateClip(headlineClip.id, {
                      textConfig: {
                        ...headlineClip.textConfig,
                        text: e.target.value,
                      },
                    });
                  }
                }}
                onBlur={() => setEditingHeadlineInline(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingHeadlineInline(false);
                }}
                className="hero-inline-input headline-input"
              />
            ) : (
              <h1
                className="hero-editorial-headline"
                onDoubleClick={() => setEditingHeadlineInline(true)}
              >
                {headlineText}
              </h1>
            )}
          </div>

          {/* Interactive Supporting Lead */}
          <div
            className={`hero-lead-wrapper ${selectedClipId === 'clip-hero-subtitle' ? 'is-selected' : ''}`}
            onClick={() => selectClip('clip-hero-subtitle')}
            title="Click to edit supporting text"
          >
            {editingSubtitleInline ? (
              <textarea
                autoFocus
                rows={2}
                value={subtitleText}
                onChange={(e) => {
                  if (subtitleClip && subtitleClip.textConfig) {
                    updateClip(subtitleClip.id, {
                      textConfig: {
                        ...subtitleClip.textConfig,
                        text: e.target.value,
                      },
                    });
                  }
                }}
                onBlur={() => setEditingSubtitleInline(false)}
                className="hero-inline-input lead-input"
              />
            ) : (
              <p
                className="hero-editorial-lead"
                onDoubleClick={() => setEditingSubtitleInline(true)}
              >
                {subtitleText}
              </p>
            )}
          </div>

          {/* Action Row: Primary Inquiry, Explore Work, Undo/Redo, Export */}
          <div className="hero-action-row">
            <button
              onClick={onStartProject}
              className="studio-btn-primary"
              title="Request Studio Production Services"
            >
              <span>Start a project</span>
              <ArrowUpRight size={14} />
            </button>

            <button
              onClick={onExploreWork}
              className="hero-action-secondary"
              title="View Curated Portfolio Projects"
            >
              <span>Explore our work</span>
              <ArrowDown size={15} />
            </button>

            <button
              onClick={() => setIsExportOpen(true)}
              className="hero-action-subtle"
              title="Render and download sequence as MP4 / WebM"
            >
              <Download size={14} />
              <span>Export Video</span>
            </button>

            <div className="hero-history-btns">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="history-btn"
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <RotateCcw size={13} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="history-btn"
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
              >
                <RotateCw size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* The Composition Canvas Workspace */}
        <div className="featured-media-frame">
          <HeroCanvasWorkspace onStartProject={onStartProject} />

          {/* Scene Selector Pills & Playback Controls Bar */}
          <div className="media-caption-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                onClick={togglePlay}
                className="studio-btn-subtle"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  color: isPlaying ? '#ffffff' : '#a1a1aa',
                  padding: '4px 8px',
                }}
                aria-label={isPlaying ? 'Pause Reel' : 'Play Reel'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                <span>{isPlaying ? 'Pause Reel' : 'Play Reel'}</span>
              </button>
            </div>

            {/* Presets Scene Switcher */}
            <div className="scene-selector-pills">
              {PRESET_SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => handleSelectScene(idx)}
                  className={`scene-pill ${activeSceneIndex === idx ? 'active' : ''}`}
                >
                  {scene.category}
                </button>
              ))}
            </div>

            <div className="media-status-meta">
              <span>Sequence: {project.aspectRatio}</span>
            </div>
          </div>

          {/* Contextual Editing Toolbar */}
          <HeroContextualToolbar />

          {/* Footage & B-Roll Library Tray */}
          <HeroFootageTray />

          {/* Integrated Compact Multitrack Timeline */}
          <HeroCompactTimeline />
        </div>
      </div>

      {/* Render & Export Video Modal */}
      <ExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </section>
  );
};
