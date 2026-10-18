import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Upload,
  Grid,
} from 'lucide-react';
import { useEditor } from '../../editor/context/EditorContext';
import { renderFrameToCanvas } from '../../editor/engine/renderer';
import { framesToTimecode } from '../../editor/utils/timecode';
import { interpolateProperty } from '../../editor/utils/interpolation';
import { processImportedFile } from '../../editor/utils/mediaUtils';
import { TimelineClip } from '../../editor/types';

interface HeroCanvasWorkspaceProps {
  onStartProject?: () => void;
}

export const HeroCanvasWorkspace: React.FC<HeroCanvasWorkspaceProps> = () => {
  const {
    project,
    currentFrame,
    isPlaying,
    selectedClipId,
    selectedClip,
    updateClip,
    selectClip,
    engine,
    togglePlay,
    importAsset,
    addClip,
  } = useEditor();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [isInteracting, setIsInteracting] = useState<'move' | 'scale' | null>(null);

  // Interaction tracking state
  const dragStart = useRef<{
    clientX: number;
    clientY: number;
    clipX: number;
    clipY: number;
    clipScale: number;
    canvasW: number;
    canvasH: number;
  }>({
    clientX: 0,
    clientY: 0,
    clipX: 0,
    clipY: 0,
    clipScale: 1,
    canvasW: 1920,
    canvasH: 1080,
  });

  const [renderRevision, setRenderRevision] = useState(0);

  const handleMediaLoaded = useCallback(() => {
    setRenderRevision((prev) => prev + 1);
  }, []);

  // Render current frame to canvas
  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderFrameToCanvas(ctx, project, currentFrame, engine.getMediaElements(), {
      selectedClipId,
      drawSelectionOutline: true,
      onMediaLoaded: handleMediaLoaded,
    });

    // Optional subtle composition grid
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Rule of thirds
      const w = project.width;
      const h = project.height;
      ctx.beginPath();
      ctx.moveTo(w / 3, 0);
      ctx.lineTo(w / 3, h);
      ctx.moveTo((2 * w) / 3, 0);
      ctx.lineTo((2 * w) / 3, h);
      ctx.moveTo(0, h / 3);
      ctx.lineTo(w, h / 3);
      ctx.moveTo(0, (2 * h) / 3);
      ctx.lineTo(w, (2 * h) / 3);
      ctx.stroke();

      ctx.restore();
    }
  }, [project, currentFrame, selectedClipId, engine, showGrid, renderRevision, handleMediaLoaded]);

  // Subscribe to engine media-loaded events for instant canvas repaint
  useEffect(() => {
    const unsub = engine.subscribeMediaLoaded(() => {
      drawFrame();
    });
    return () => unsub();
  }, [engine, drawFrame]);

  useEffect(() => {
    drawFrame();
  }, [drawFrame]);

  // Compute estimated bounds of a clip for hit-testing
  const getClipBounds = (clip: TimelineClip, canvasW: number, canvasH: number) => {
    let w = canvasW * 0.8;
    let h = canvasH * 0.8;

    if (clip.type === 'image' || clip.type === 'video') {
      const mediaEl = clip.assetId ? engine.getMediaElements().get(clip.assetId) : null;
      if (mediaEl) {
        const srcW = (mediaEl as HTMLVideoElement).videoWidth || (mediaEl as HTMLImageElement).naturalWidth || canvasW;
        const srcH = (mediaEl as HTMLVideoElement).videoHeight || (mediaEl as HTMLImageElement).naturalHeight || canvasH;
        const aspect = srcW / srcH;
        w = canvasW;
        h = canvasW / aspect;
        if (h > canvasH) {
          h = canvasH;
          w = canvasH * aspect;
        }
      } else {
        w = canvasW;
        h = canvasH;
      }
    } else if (clip.type === 'text' && clip.textConfig) {
      const fontSize = clip.textConfig.fontSize || 48;
      const lines = (clip.textConfig.text || '').split('\n');
      const maxLineLen = Math.max(...lines.map((l) => l.length), 1);
      w = Math.max(200, maxLineLen * fontSize * 0.6);
      h = Math.max(50, lines.length * fontSize * 1.3);
    }

    return { width: w, height: h };
  };

  // Hit test against active clips (topmost track order first)
  const findClipAtCoord = (canvasX: number, canvasY: number): { clip: TimelineClip; isHandle: boolean } | null => {
    const sortedTracks = [...project.tracks].sort((a, b) => a.order - b.order);

    for (const track of sortedTracks) {
      if (!track.visible) continue;
      const activeClips = project.clips.filter(
        (c) =>
          c.trackId === track.id &&
          currentFrame >= c.startFrame &&
          currentFrame < c.startFrame + c.durationFrames
      );

      for (const clip of activeClips) {
        const posX = interpolateProperty(clip.keyframes?.x, currentFrame, clip.transform.x);
        const posY = interpolateProperty(clip.keyframes?.y, currentFrame, clip.transform.y);
        const scale = interpolateProperty(clip.keyframes?.scale, currentFrame, clip.transform.scale);
        const opacity = interpolateProperty(clip.keyframes?.opacity, currentFrame, clip.transform.opacity);

        if (opacity <= 0.05) continue;

        const centerX = project.width / 2 + posX;
        const centerY = project.height / 2 + posY;
        const dx = (canvasX - centerX) / (scale || 1);
        const dy = (canvasY - centerY) / (scale || 1);

        const bounds = getClipBounds(clip, project.width, project.height);
        const halfW = bounds.width / 2 + 16;
        const halfH = bounds.height / 2 + 16;

        // Check if corner resize handle of currently selected clip was hit
        if (selectedClipId === clip.id) {
          const handleCorners = [
            { x: -halfW, y: -halfH },
            { x: halfW, y: -halfH },
            { x: -halfW, y: halfH },
            { x: halfW, y: halfH },
          ];
          for (const corner of handleCorners) {
            if (Math.abs(dx - corner.x) <= 24 && Math.abs(dy - corner.y) <= 24) {
              return { clip, isHandle: true };
            }
          }
        }

        // Inside bounds
        if (Math.abs(dx) <= halfW && Math.abs(dy) <= halfH) {
          return { clip, isHandle: false };
        }
      }
    }

    return null;
  };

  // Mouse Down: Hit test, select clip, or initiate drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleFactorX = project.width / rect.width;
    const scaleFactorY = project.height / rect.height;

    const clickCanvasX = (e.clientX - rect.left) * scaleFactorX;
    const clickCanvasY = (e.clientY - rect.top) * scaleFactorY;

    const hit = findClipAtCoord(clickCanvasX, clickCanvasY);

    if (hit) {
      selectClip(hit.clip.id);
      setIsInteracting(hit.isHandle ? 'scale' : 'move');
      dragStart.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        clipX: hit.clip.transform.x,
        clipY: hit.clip.transform.y,
        clipScale: hit.clip.transform.scale,
        canvasW: rect.width,
        canvasH: rect.height,
      };
    } else {
      // Clicked on empty canvas space -> deselect clip to expose Sequence settings
      selectClip(null);
    }
  };

  // Mouse Move: Reposition or scale clip
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInteracting || !selectedClip || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleFactorX = project.width / rect.width;
    const scaleFactorY = project.height / rect.height;

    const deltaPixelX = (e.clientX - dragStart.current.clientX) * scaleFactorX;
    const deltaPixelY = (e.clientY - dragStart.current.clientY) * scaleFactorY;

    if (isInteracting === 'move') {
      updateClip(selectedClip.id, {
        transform: {
          ...selectedClip.transform,
          x: Math.round(dragStart.current.clipX + deltaPixelX),
          y: Math.round(dragStart.current.clipY + deltaPixelY),
        },
      });
    } else if (isInteracting === 'scale') {
      const distanceDelta = (deltaPixelX + deltaPixelY) / 400;
      const newScale = Math.max(0.2, Math.min(3.5, dragStart.current.clipScale + distanceDelta));
      updateClip(selectedClip.id, {
        transform: {
          ...selectedClip.transform,
          scale: parseFloat(newScale.toFixed(2)),
        },
      });
    }
  };

  const handleMouseUp = () => {
    setIsInteracting(null);
  };

  // File Upload / Drop Handling
  const handleImportFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const asset = await processImportedFile(file, project.fps || 30);
        importAsset(asset);

        // Preload & register immediately into engine
        if (asset.type === 'image') {
          const img = new Image();
          img.src = asset.url;
          img.onload = () => engine.notifyMediaLoaded();
          engine.registerMediaElement(asset.id, img);
        } else if (asset.type === 'video') {
          const video = document.createElement('video');
          video.muted = true;
          video.playsInline = true;
          video.src = asset.url;
          video.onloadeddata = () => engine.notifyMediaLoaded();
          engine.registerMediaElement(asset.id, video);
        }

        // Also update clip-hero-media so the background preview immediately displays the imported asset
        const heroMediaClip = project.clips.find((c) => c.id === 'clip-hero-media');
        if (heroMediaClip) {
          updateClip(heroMediaClip.id, {
            assetId: asset.id,
            name: asset.name,
            type: asset.type === 'image' ? 'image' : 'video',
          });
        }

        // If a media clip is currently selected, replace its asset directly
        if (selectedClip && (selectedClip.type === 'video' || selectedClip.type === 'image')) {
          updateClip(selectedClip.id, {
            assetId: asset.id,
            name: asset.name,
            type: asset.type === 'image' ? 'image' : 'video',
          });
        } else {
          // Add to V1 or A1
          const targetTrack = project.tracks.find((t) => t.type === (asset.type === 'audio' ? 'audio' : 'video')) || project.tracks[0];
          const newClipId = addClip({
            trackId: targetTrack.id,
            assetId: asset.id,
            name: asset.name,
            type: asset.type === 'image' ? 'image' : asset.type === 'video' ? 'video' : 'audio',
            startFrame: currentFrame,
            durationFrames: Math.min(asset.durationFrames, 300),
            sourceInFrame: 0,
            sourceOutFrame: Math.min(asset.durationFrames, 300),
            speed: 1.0,
            transform: { x: 0, y: 0, scale: 1.0, rotation: 0, opacity: 1.0 },
          });
          selectClip(newClipId);
        }
      } catch (err: any) {
        console.error('File import failed:', err);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleImportFiles(e.dataTransfer.files);
  };

  const timecodeDisplay = framesToTimecode(currentFrame, project.fps || 30);

  return (
    <div
      className="hero-canvas-wrapper"
      ref={containerRef}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Monitor Tag Bar */}
      <div className="canvas-monitor-header">
        <div className="monitor-meta-group">
          <span className="live-dot" />
          <span className="monitor-meta-title">Interactive Composition Canvas</span>
          <span className="monitor-res-pill">{project.aspectRatio} • {project.width}×{project.height}</span>
          <span className="monitor-res-pill">{timecodeDisplay}</span>
        </div>

        <div className="monitor-actions-group">
          <button
            onClick={() => setShowGrid((prev) => !prev)}
            className={`monitor-icon-btn ${showGrid ? 'active' : ''}`}
            title="Toggle Composition Grid"
            aria-label="Toggle Grid"
          >
            <Grid size={14} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="monitor-import-btn"
            title="Import video, photo, or audio file"
            aria-label="Import Media File"
          >
            <Upload size={13} />
            <span>Import Media</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            style={{ display: 'none' }}
            onChange={(e) => handleImportFiles(e.target.files)}
          />
        </div>
      </div>

      {/* Canvas Viewport Frame */}
      <div className="canvas-viewport-container">
        <canvas
          ref={canvasRef}
          width={project.width}
          height={project.height}
          className="hero-canvas-element"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          role="img"
          aria-label="Interactive video preview composition canvas"
        />

        {/* Center Play Overlay when paused and not actively dragging */}
        {!isPlaying && !isInteracting && (
          <div
            className="canvas-center-play"
            onClick={togglePlay}
            role="button"
            tabIndex={0}
            aria-label="Play sequence"
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                togglePlay();
              }
            }}
          >
            <div className="canvas-play-circle" title="Play Preview (Space)">
              <Play size={24} fill="#09090b" style={{ marginLeft: 3 }} />
            </div>
          </div>
        )}

        {/* Drag & Drop Overlay */}
        {isDragOver && (
          <div className="canvas-dropzone-overlay">
            <div className="dropzone-card">
              <Upload size={28} className="text-amber" />
              <span>Drop media to replace layer or add to sequence</span>
            </div>
          </div>
        )}

        {/* Floating Quick Selection Tooltip */}
        {selectedClip && (
          <div className="canvas-selection-pill">
            <span className={`pill-badge badge-${selectedClip.type}`}>{selectedClip.type}</span>
            <span className="pill-name">{selectedClip.name}</span>
            <span className="pill-hint">Drag to move • Corner to scale</span>
          </div>
        )}
      </div>
    </div>
  );
};
