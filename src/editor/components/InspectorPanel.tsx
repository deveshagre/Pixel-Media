import React, { useState } from 'react';
import {
  Sliders,
  Type,
  Volume2,
  Sparkles,
  RotateCcw,
  Plus,
  Trash2,
  Settings,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { TextConfig, AudioConfig, Keyframe, EasingType } from '../types';

export const InspectorPanel: React.FC = () => {
  const {
    project,
    selectedClip,
    updateClip,
    currentFrame,
    updateProjectMeta,
  } = useEditor();

  const [activeTab, setActiveTab] = useState<'transform' | 'text' | 'audio' | 'keyframes'>('transform');

  if (!selectedClip) {
    return (
      <div className="nle-inspector-panel">
        <div className="inspector-header">
          <Settings size={15} className="text-amber" />
          <span className="inspector-title">Sequence Settings</span>
        </div>

        <div className="inspector-section">
          <label className="param-label">Sequence Name</label>
          <input
            type="text"
            className="param-input"
            value={project.name}
            onChange={(e) => updateProjectMeta({ name: e.target.value })}
          />

          <div className="param-grid-2">
            <div>
              <label className="param-label">Resolution</label>
              <div className="param-readonly">{project.width} x {project.height}</div>
            </div>
            <div>
              <label className="param-label">Frame Rate</label>
              <div className="param-readonly">{project.fps} FPS</div>
            </div>
          </div>

          <div className="param-grid-2">
            <div>
              <label className="param-label">Duration (Frames)</label>
              <input
                type="number"
                className="param-input"
                min={30}
                max={36000}
                value={project.durationFrames}
                onChange={(e) => updateProjectMeta({ durationFrames: parseInt(e.target.value, 10) || 600 })}
              />
            </div>
            <div>
              <label className="param-label">Background</label>
              <input
                type="color"
                className="param-color-input"
                value={project.backgroundColor}
                onChange={(e) => updateProjectMeta({ backgroundColor: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
            <span style={{ fontSize: 11, color: '#71717a' }}>
              Select any clip on the timeline to inspect and edit its transforms, typography, audio gain, and keyframes.
            </span>
          </div>
        </div>
      </div>
    );
  }

  const { transform, textConfig, audioConfig, keyframes } = selectedClip;

  // Transform updates
  const handleTransformChange = (key: keyof typeof transform, val: number) => {
    updateClip(selectedClip.id, {
      transform: {
        ...transform,
        [key]: val,
      },
    });
  };

  const handleResetTransform = () => {
    updateClip(selectedClip.id, {
      transform: {
        x: 0,
        y: 0,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
      },
    });
  };

  // Text updates
  const handleTextChange = (updates: Partial<TextConfig>) => {
    if (!textConfig) return;
    updateClip(selectedClip.id, {
      textConfig: {
        ...textConfig,
        ...updates,
      },
    });
  };

  // Audio updates
  const handleAudioChange = (updates: Partial<AudioConfig>) => {
    const current = audioConfig || { volume: 1.0, fadeInFrames: 0, fadeOutFrames: 0, muted: false };
    updateClip(selectedClip.id, {
      audioConfig: {
        ...current,
        ...updates,
      },
    });
  };

  // Keyframe management
  const handleAddKeyframe = (property: 'x' | 'y' | 'scale' | 'rotation' | 'opacity') => {
    const currentVal = transform[property];
    const existing = keyframes?.[property] || [];
    const newKf: Keyframe = {
      id: `kf-${Date.now()}`,
      frame: currentFrame,
      value: currentVal,
      easing: 'ease-in-out',
    };

    const updated = [...existing.filter((k) => k.frame !== currentFrame), newKf].sort(
      (a, b) => a.frame - b.frame
    );

    updateClip(selectedClip.id, {
      keyframes: {
        ...keyframes,
        [property]: updated,
      },
    });
  };

  const handleDeleteKeyframe = (property: 'x' | 'y' | 'scale' | 'rotation' | 'opacity', kfId: string) => {
    if (!keyframes || !keyframes[property]) return;
    updateClip(selectedClip.id, {
      keyframes: {
        ...keyframes,
        [property]: keyframes[property]?.filter((k) => k.id !== kfId),
      },
    });
  };

  const handleEasingChange = (
    property: 'x' | 'y' | 'scale' | 'rotation' | 'opacity',
    kfId: string,
    easing: EasingType
  ) => {
    if (!keyframes || !keyframes[property]) return;
    updateClip(selectedClip.id, {
      keyframes: {
        ...keyframes,
        [property]: keyframes[property]?.map((k) => (k.id === kfId ? { ...k, easing } : k)),
      },
    });
  };

  return (
    <div className="nle-inspector-panel">
      {/* Header with clip identity */}
      <div className="inspector-header">
        <div className="clip-id-row">
          <span className={`badge-pill badge-${selectedClip.type}`}>{selectedClip.type}</span>
          <span className="selected-clip-name" title={selectedClip.name}>
            {selectedClip.name}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="inspector-tabs">
        <button
          className={`insp-tab-btn ${activeTab === 'transform' ? 'active' : ''}`}
          onClick={() => setActiveTab('transform')}
          title="Spatial Transforms"
        >
          <Sliders size={13} />
          <span>Transform</span>
        </button>

        {selectedClip.type === 'text' && (
          <button
            className={`insp-tab-btn ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
            title="Typography & Text Styling"
          >
            <Type size={13} />
            <span>Text</span>
          </button>
        )}

        {(selectedClip.type === 'audio' || selectedClip.type === 'video') && (
          <button
            className={`insp-tab-btn ${activeTab === 'audio' ? 'active' : ''}`}
            onClick={() => setActiveTab('audio')}
            title="Audio Levels & Envelopes"
          >
            <Volume2 size={13} />
            <span>Audio</span>
          </button>
        )}

        <button
          className={`insp-tab-btn ${activeTab === 'keyframes' ? 'active' : ''}`}
          onClick={() => setActiveTab('keyframes')}
          title="Keyframe Animation"
        >
          <Sparkles size={13} />
          <span>Motion</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="inspector-body">
        {/* TRANSFORM TAB */}
        {activeTab === 'transform' && (
          <div className="inspector-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-subtitle">2D Transform</span>
              <button
                onClick={handleResetTransform}
                className="param-reset-btn"
                title="Reset transforms"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Position X / Y */}
            <div className="param-grid-2">
              <div>
                <label className="param-label">Position X (px)</label>
                <input
                  type="number"
                  className="param-input"
                  value={transform.x}
                  onChange={(e) => handleTransformChange('x', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="param-label">Position Y (px)</label>
                <input
                  type="number"
                  className="param-input"
                  value={transform.y}
                  onChange={(e) => handleTransformChange('y', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Scale */}
            <div className="param-row">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="param-label">Scale</label>
                <span className="param-value-tag">{Math.round(transform.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={transform.scale}
                onChange={(e) => handleTransformChange('scale', parseFloat(e.target.value))}
                className="param-slider"
              />
            </div>

            {/* Rotation */}
            <div className="param-row">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="param-label">Rotation</label>
                <span className="param-value-tag">{Math.round(transform.rotation)}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={transform.rotation}
                onChange={(e) => handleTransformChange('rotation', parseFloat(e.target.value))}
                className="param-slider"
              />
            </div>

            {/* Opacity */}
            <div className="param-row">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="param-label">Opacity</label>
                <span className="param-value-tag">{Math.round(transform.opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.02"
                value={transform.opacity}
                onChange={(e) => handleTransformChange('opacity', parseFloat(e.target.value))}
                className="param-slider"
              />
            </div>
          </div>
        )}

        {/* TEXT TAB */}
        {activeTab === 'text' && textConfig && (
          <div className="inspector-section">
            <span className="section-subtitle">Typography</span>

            <div className="param-row">
              <label className="param-label">Content</label>
              <textarea
                className="param-textarea"
                rows={3}
                value={textConfig.text}
                onChange={(e) => handleTextChange({ text: e.target.value })}
              />
            </div>

            <div className="param-grid-2">
              <div>
                <label className="param-label">Font Family</label>
                <select
                  className="param-select"
                  value={textConfig.fontFamily}
                  onChange={(e) => handleTextChange({ fontFamily: e.target.value })}
                >
                  <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                  <option value="Impact, sans-serif">Impact (Bold)</option>
                  <option value="serif">Cinematic Serif</option>
                  <option value="monospace">Monospace Code</option>
                </select>
              </div>
              <div>
                <label className="param-label">Size (px)</label>
                <input
                  type="number"
                  className="param-input"
                  min={12}
                  max={200}
                  value={textConfig.fontSize}
                  onChange={(e) => handleTextChange({ fontSize: parseInt(e.target.value, 10) || 40 })}
                />
              </div>
            </div>

            <div className="param-grid-2">
              <div>
                <label className="param-label">Text Color</label>
                <input
                  type="color"
                  className="param-color-input"
                  value={textConfig.color}
                  onChange={(e) => handleTextChange({ color: e.target.value })}
                />
              </div>
              <div>
                <label className="param-label">Alignment</label>
                <select
                  className="param-select"
                  value={textConfig.align}
                  onChange={(e) => handleTextChange({ align: e.target.value as any })}
                >
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>

            <div className="param-row">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="param-label">Drop Shadow Blur</label>
                <span className="param-value-tag">{textConfig.shadowBlur || 0}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={textConfig.shadowBlur || 0}
                onChange={(e) => handleTextChange({ shadowBlur: parseInt(e.target.value, 10) })}
                className="param-slider"
              />
            </div>
          </div>
        )}

        {/* AUDIO TAB */}
        {activeTab === 'audio' && (
          <div className="inspector-section">
            <span className="section-subtitle">Audio Mixing</span>

            <div className="param-row">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="param-label">Volume Level</label>
                <span className="param-value-tag">
                  {Math.round((audioConfig?.volume ?? 1.0) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.05"
                value={audioConfig?.volume ?? 1.0}
                onChange={(e) => handleAudioChange({ volume: parseFloat(e.target.value) })}
                className="param-slider"
              />
            </div>

            <div className="param-grid-2">
              <div>
                <label className="param-label">Fade In (Frames)</label>
                <input
                  type="number"
                  className="param-input"
                  min={0}
                  max={120}
                  value={audioConfig?.fadeInFrames ?? 0}
                  onChange={(e) => handleAudioChange({ fadeInFrames: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
              <div>
                <label className="param-label">Fade Out (Frames)</label>
                <input
                  type="number"
                  className="param-input"
                  min={0}
                  max={120}
                  value={audioConfig?.fadeOutFrames ?? 0}
                  onChange={(e) => handleAudioChange({ fadeOutFrames: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
            </div>
          </div>
        )}

        {/* KEYFRAMES TAB */}
        {activeTab === 'keyframes' && (
          <div className="inspector-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="section-subtitle">Animate at Frame {currentFrame}</span>
            </div>

            {/* Keyframe buttons */}
            <div className="kf-actions-grid">
              <button
                onClick={() => handleAddKeyframe('scale')}
                className="kf-add-btn"
                title="Add Scale Keyframe at playhead"
              >
                <Plus size={12} />
                <span>+ Scale ({Math.round(transform.scale * 100)}%)</span>
              </button>

              <button
                onClick={() => handleAddKeyframe('opacity')}
                className="kf-add-btn"
                title="Add Opacity Keyframe at playhead"
              >
                <Plus size={12} />
                <span>+ Opacity ({Math.round(transform.opacity * 100)}%)</span>
              </button>

              <button
                onClick={() => handleAddKeyframe('x')}
                className="kf-add-btn"
                title="Add Position X Keyframe at playhead"
              >
                <Plus size={12} />
                <span>+ Pos X ({transform.x}px)</span>
              </button>

              <button
                onClick={() => handleAddKeyframe('y')}
                className="kf-add-btn"
                title="Add Position Y Keyframe at playhead"
              >
                <Plus size={12} />
                <span>+ Pos Y ({transform.y}px)</span>
              </button>
            </div>

            {/* List of active keyframes */}
            <div className="active-kf-list">
              <span style={{ fontSize: 11, color: '#71717a', display: 'block', margin: '14px 0 6px' }}>
                Keyframe Tracks on this Clip:
              </span>

              {keyframes && Object.keys(keyframes).length > 0 ? (
                Object.entries(keyframes).map(([prop, list]) => {
                  if (!list || list.length === 0) return null;
                  return (
                    <div key={prop} className="kf-prop-group">
                      <span className="kf-prop-title">{prop.toUpperCase()}</span>
                      {list.map((kf) => (
                        <div key={kf.id} className="kf-item-row">
                          <span className="kf-frame-tag">Frame {kf.frame}</span>
                          <span className="kf-val-tag">{Math.round(kf.value * 100) / 100}</span>
                          <select
                            value={kf.easing}
                            onChange={(e) =>
                              handleEasingChange(
                                prop as any,
                                kf.id,
                                e.target.value as EasingType
                              )
                            }
                            className="kf-easing-select"
                          >
                            <option value="linear">Linear</option>
                            <option value="ease-in">Ease In</option>
                            <option value="ease-out">Ease Out</option>
                            <option value="ease-in-out">Ease In-Out</option>
                          </select>
                          <button
                            onClick={() => handleDeleteKeyframe(prop as any, kf.id)}
                            className="kf-del-btn"
                            title="Delete keyframe"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })
              ) : (
                <span style={{ fontSize: 11, color: '#52525b', fontStyle: 'italic' }}>
                  No keyframes set on this clip yet. Click one of the buttons above to set a keyframe at the current playhead frame.
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
