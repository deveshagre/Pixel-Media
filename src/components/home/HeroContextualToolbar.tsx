import React, { useRef } from 'react';
import {
  Type,
  Sliders,
  RotateCcw,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Ratio,
} from 'lucide-react';
import { useEditor } from '../../editor/context/EditorContext';
import { AspectRatio } from '../../editor/types';
import { processImportedFile } from '../../editor/utils/mediaUtils';

export const HeroContextualToolbar: React.FC = () => {
  const {
    project,
    selectedClip,
    updateClip,
    setAspectRatio,
    updateProjectMeta,
    importAsset,
  } = useEditor();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // File replacement for selected image/video
  const handleReplaceMedia = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedClip) return;
    try {
      const asset = await processImportedFile(files[0], project.fps || 30);
      importAsset(asset);
      updateClip(selectedClip.id, {
        assetId: asset.id,
        name: asset.name,
        type: asset.type === 'image' ? 'image' : 'video',
      });
    } catch (err) {
      console.error('Media replacement failed:', err);
    }
  };

  // Preset motion animations
  const applyMotionPreset = (preset: 'fade' | 'slide_up' | 'scale_zoom' | 'kinetic') => {
    if (!selectedClip) return;
    const dur = selectedClip.durationFrames;
    const start = selectedClip.startFrame;

    if (preset === 'fade') {
      updateClip(selectedClip.id, {
        keyframes: {
          ...selectedClip.keyframes,
          opacity: [
            { id: `kf-o1-${Date.now()}`, frame: start, value: 0, easing: 'ease-out' },
            { id: `kf-o2-${Date.now()}`, frame: start + 25, value: 1, easing: 'linear' },
            { id: `kf-o3-${Date.now()}`, frame: start + dur - 20, value: 1, easing: 'ease-in' },
            { id: `kf-o4-${Date.now()}`, frame: start + dur, value: 0, easing: 'linear' },
          ],
        },
      });
    } else if (preset === 'slide_up') {
      updateClip(selectedClip.id, {
        keyframes: {
          ...selectedClip.keyframes,
          opacity: [
            { id: `kf-o1-${Date.now()}`, frame: start, value: 0, easing: 'ease-out' },
            { id: `kf-o2-${Date.now()}`, frame: start + 20, value: 1, easing: 'linear' },
          ],
          y: [
            { id: `kf-y1-${Date.now()}`, frame: start, value: selectedClip.transform.y + 40, easing: 'ease-out' },
            { id: `kf-y2-${Date.now()}`, frame: start + 30, value: selectedClip.transform.y, easing: 'ease-in-out' },
          ],
        },
      });
    } else if (preset === 'scale_zoom') {
      updateClip(selectedClip.id, {
        keyframes: {
          ...selectedClip.keyframes,
          scale: [
            { id: `kf-s1-${Date.now()}`, frame: start, value: 0.85, easing: 'ease-out' },
            { id: `kf-s2-${Date.now()}`, frame: start + 35, value: 1.05, easing: 'ease-in-out' },
            { id: `kf-s3-${Date.now()}`, frame: start + dur, value: 1.15, easing: 'linear' },
          ],
        },
      });
    } else if (preset === 'kinetic') {
      updateClip(selectedClip.id, {
        keyframes: {
          scale: [
            { id: `kf-s1-${Date.now()}`, frame: start, value: 0.9, easing: 'ease-out' },
            { id: `kf-s2-${Date.now()}`, frame: start + 25, value: 1.0, easing: 'ease-in-out' },
          ],
          opacity: [
            { id: `kf-o1-${Date.now()}`, frame: start, value: 0, easing: 'ease-out' },
            { id: `kf-o2-${Date.now()}`, frame: start + 18, value: 1, easing: 'linear' },
          ],
          rotation: [
            { id: `kf-r1-${Date.now()}`, frame: start, value: -2, easing: 'ease-out' },
            { id: `kf-r2-${Date.now()}`, frame: start + 25, value: 0, easing: 'ease-in-out' },
          ],
        },
      });
    }
  };

  // Reset transform
  const handleResetTransform = () => {
    if (!selectedClip) return;
    updateClip(selectedClip.id, {
      transform: {
        x: 0,
        y: selectedClip.type === 'text' ? (selectedClip.id.includes('headline') ? -45 : 55) : 0,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
      },
    });
  };

  // SEQUENCE LEVEL CONTROLS (Empty canvas selected)
  if (!selectedClip) {
    return (
      <div className="hero-contextual-bar" role="toolbar" aria-label="Sequence Settings">
        <div className="context-bar-label">
          <Ratio size={14} className="text-amber" />
          <span>Composition Settings</span>
        </div>

        <div className="context-controls-row">
          {/* Aspect Ratio */}
          <div className="context-group">
            <span className="control-label">Aspect</span>
            <div className="btn-pill-group">
              {(['16:9', '9:16', '1:1', '21:9'] as AspectRatio[]).map((aspect) => (
                <button
                  key={aspect}
                  onClick={() => setAspectRatio(aspect)}
                  className={`ctx-pill-btn ${project.aspectRatio === aspect ? 'active' : ''}`}
                >
                  {aspect}
                </button>
              ))}
            </div>
          </div>

          {/* Background color */}
          <div className="context-group">
            <span className="control-label">Background</span>
            <input
              type="color"
              value={project.backgroundColor}
              onChange={(e) => updateProjectMeta({ backgroundColor: e.target.value })}
              className="ctx-color-picker"
              title="Canvas background color"
            />
          </div>

          {/* Duration */}
          <div className="context-group">
            <span className="control-label">Duration</span>
            <select
              value={project.durationFrames}
              onChange={(e) => updateProjectMeta({ durationFrames: parseInt(e.target.value, 10) })}
              className="ctx-select"
            >
              <option value={300}>10 Seconds (300f)</option>
              <option value={600}>20 Seconds (600f)</option>
              <option value={900}>30 Seconds (900f)</option>
            </select>
          </div>

          <span className="context-tip">
            Tip: Click any layer on canvas or timeline to edit typography, position, or animations.
          </span>
        </div>
      </div>
    );
  }

  // TEXT LAYER CONTROLS
  if (selectedClip.type === 'text' && selectedClip.textConfig) {
    const cfg = selectedClip.textConfig;
    return (
      <div className="hero-contextual-bar" role="toolbar" aria-label="Text Layer Controls">
        <div className="context-bar-label">
          <Type size={14} className="text-amber" />
          <span>Text: {selectedClip.name}</span>
        </div>

        <div className="context-controls-row">
          {/* Quick Text Input */}
          <div className="context-group flex-1">
            <input
              type="text"
              value={cfg.text}
              onChange={(e) =>
                updateClip(selectedClip.id, {
                  textConfig: { ...cfg, text: e.target.value },
                })
              }
              placeholder="Edit text content..."
              className="ctx-text-input"
            />
          </div>

          {/* Font Size */}
          <div className="context-group">
            <span className="control-label">Size</span>
            <input
              type="number"
              min={12}
              max={160}
              value={cfg.fontSize}
              onChange={(e) =>
                updateClip(selectedClip.id, {
                  textConfig: { ...cfg, fontSize: parseInt(e.target.value, 10) || 32 },
                })
              }
              className="ctx-number-input"
            />
          </div>

          {/* Color Palette */}
          <div className="context-group">
            <span className="control-label">Color</span>
            <div className="color-swatches">
              {['#ffffff', '#e4b363', '#38bdf8', '#f43f5e', '#a1a1aa'].map((c) => (
                <button
                  key={c}
                  style={{ background: c }}
                  onClick={() =>
                    updateClip(selectedClip.id, {
                      textConfig: { ...cfg, color: c },
                    })
                  }
                  className={`color-dot ${cfg.color.toLowerCase() === c.toLowerCase() ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          {/* Alignment */}
          <div className="context-group">
            <div className="btn-pill-group">
              <button
                onClick={() => updateClip(selectedClip.id, { textConfig: { ...cfg, align: 'left' } })}
                className={`ctx-pill-btn ${cfg.align === 'left' ? 'active' : ''}`}
                title="Align Left"
              >
                <AlignLeft size={13} />
              </button>
              <button
                onClick={() => updateClip(selectedClip.id, { textConfig: { ...cfg, align: 'center' } })}
                className={`ctx-pill-btn ${cfg.align === 'center' ? 'active' : ''}`}
                title="Align Center"
              >
                <AlignCenter size={13} />
              </button>
              <button
                onClick={() => updateClip(selectedClip.id, { textConfig: { ...cfg, align: 'right' } })}
                className={`ctx-pill-btn ${cfg.align === 'right' ? 'active' : ''}`}
                title="Align Right"
              >
                <AlignRight size={13} />
              </button>
            </div>
          </div>

          {/* Motion Presets */}
          <div className="context-group">
            <span className="control-label">Motion</span>
            <div className="btn-pill-group">
              <button onClick={() => applyMotionPreset('fade')} className="ctx-pill-btn">
                Fade
              </button>
              <button onClick={() => applyMotionPreset('slide_up')} className="ctx-pill-btn">
                Slide
              </button>
              <button onClick={() => applyMotionPreset('kinetic')} className="ctx-pill-btn">
                Kinetic
              </button>
            </div>
          </div>

          {/* Reset button */}
          <button onClick={handleResetTransform} className="ctx-icon-action" title="Reset Transforms">
            <RotateCcw size={13} />
          </button>
        </div>
      </div>
    );
  }

  // IMAGE / VIDEO MEDIA CONTROLS
  const { transform } = selectedClip;
  return (
    <div className="hero-contextual-bar" role="toolbar" aria-label="Media Layer Controls">
      <div className="context-bar-label">
        <Sliders size={14} className="text-amber" />
        <span>Media: {selectedClip.name}</span>
      </div>

      <div className="context-controls-row">
        {/* Replace Media */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="ctx-btn-highlight"
          title="Replace image or video file"
        >
          <Upload size={13} />
          <span>Replace Media</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={(e) => handleReplaceMedia(e.target.files)}
        />

        {/* Scale Slider */}
        <div className="context-group">
          <span className="control-label">Scale ({Math.round(transform.scale * 100)}%)</span>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.05"
            value={transform.scale}
            onChange={(e) =>
              updateClip(selectedClip.id, {
                transform: { ...transform, scale: parseFloat(e.target.value) },
              })
            }
            className="ctx-slider"
          />
        </div>

        {/* Opacity Slider */}
        <div className="context-group">
          <span className="control-label">Opacity ({Math.round(transform.opacity * 100)}%)</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={transform.opacity}
            onChange={(e) =>
              updateClip(selectedClip.id, {
                transform: { ...transform, opacity: parseFloat(e.target.value) },
              })
            }
            className="ctx-slider"
          />
        </div>

        {/* Motion Presets */}
        <div className="context-group">
          <span className="control-label">Motion</span>
          <div className="btn-pill-group">
            <button onClick={() => applyMotionPreset('scale_zoom')} className="ctx-pill-btn" title="Slow cinematic zoom">
              Slow Zoom
            </button>
            <button onClick={() => applyMotionPreset('fade')} className="ctx-pill-btn" title="Cinematic fade">
              Fade In
            </button>
          </div>
        </div>

        {/* Reset Transforms */}
        <button onClick={handleResetTransform} className="ctx-icon-action" title="Reset Transforms">
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
};
