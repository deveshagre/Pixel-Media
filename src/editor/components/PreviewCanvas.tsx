import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Grid,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { renderFrameToCanvas } from '../engine/renderer';
import { framesToTimecode } from '../utils/timecode';

export const PreviewCanvas: React.FC = () => {
  const {
    project,
    currentFrame,
    isPlaying,
    selectedClipId,
    selectedClip,
    updateClip,
    engine,
    togglePlay,
    stepFrame,
    jumpToStart,
    jumpToEnd,
  } = useEditor();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [showSafeMargins, setShowSafeMargins] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<'fit' | 0.5 | 1.0>('fit');
  const [isDraggingCanvas, setIsDraggingCanvas] = useState<boolean>(false);
  const dragStartPos = useRef<{ x: number; y: number; clipX: number; clipY: number }>({
    x: 0,
    y: 0,
    clipX: 0,
    clipY: 0,
  });

  const handleMediaLoaded = useCallback(() => {
    drawCurrentFrame();
  }, []);

  // Render current frame to canvas
  const drawCurrentFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderFrameToCanvas(ctx, project, currentFrame, engine.getMediaElements(), {
      selectedClipId,
      drawSelectionOutline: true,
      onMediaLoaded: handleMediaLoaded,
    });

    // Draw optional broadcast safe margins
    if (showSafeMargins) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Action safe (90%)
      const actionW = project.width * 0.9;
      const actionH = project.height * 0.9;
      ctx.strokeRect((project.width - actionW) / 2, (project.height - actionH) / 2, actionW, actionH);

      // Title safe (80%)
      const titleW = project.width * 0.8;
      const titleH = project.height * 0.8;
      ctx.strokeRect((project.width - titleW) / 2, (project.height - titleH) / 2, titleW, titleH);

      // Center crosshair
      const cx = project.width / 2;
      const cy = project.height / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy);
      ctx.lineTo(cx + 15, cy);
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx, cy + 15);
      ctx.stroke();

      ctx.restore();
    }
  }, [project, currentFrame, selectedClipId, engine, showSafeMargins, handleMediaLoaded]);

  // Subscribe to engine media-loaded events for instant canvas repaint
  useEffect(() => {
    const unsub = engine.subscribeMediaLoaded(() => {
      drawCurrentFrame();
    });
    return () => unsub();
  }, [engine, drawCurrentFrame]);

  // Redraw whenever state changes
  useEffect(() => {
    drawCurrentFrame();
  }, [drawCurrentFrame]);

  // Handle direct canvas interaction for positioning selected clip
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedClip || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleFactorX = project.width / rect.width;
    const scaleFactorY = project.height / rect.height;

    setIsDraggingCanvas(true);
    dragStartPos.current = {
      x: e.clientX * scaleFactorX,
      y: e.clientY * scaleFactorY,
      clipX: selectedClip.transform.x,
      clipY: selectedClip.transform.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingCanvas || !selectedClip || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleFactorX = project.width / rect.width;
    const scaleFactorY = project.height / rect.height;

    const currentX = e.clientX * scaleFactorX;
    const currentY = e.clientY * scaleFactorY;

    const deltaX = currentX - dragStartPos.current.x;
    const deltaY = currentY - dragStartPos.current.y;

    updateClip(selectedClip.id, {
      transform: {
        ...selectedClip.transform,
        x: Math.round(dragStartPos.current.clipX + deltaX),
        y: Math.round(dragStartPos.current.clipY + deltaY),
      },
    });
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const fps = project.fps || 30;
  const timecodeDisplay = framesToTimecode(currentFrame, fps);
  const totalDurationDisplay = framesToTimecode(project.durationFrames, fps);

  return (
    <div className="nle-preview-workspace" ref={containerRef} onMouseUp={handleMouseUp}>
      {/* Top Monitor Bar */}
      <div className="nle-monitor-bar">
        <div className="monitor-res-tag">
          <span>{project.aspectRatio}</span>
          <span style={{ color: '#71717a' }}>•</span>
          <span>{project.width}x{project.height}</span>
          <span style={{ color: '#71717a' }}>•</span>
          <span>{fps} fps</span>
        </div>

        <div className="monitor-tools">
          <button
            onClick={() => setShowSafeMargins((prev) => !prev)}
            className={`monitor-btn ${showSafeMargins ? 'active' : ''}`}
            title="Toggle Action & Title Safe Margins"
          >
            <Grid size={14} />
          </button>

          <select
            value={zoomScale}
            onChange={(e) => setZoomScale(e.target.value === 'fit' ? 'fit' : Number(e.target.value) as any)}
            className="monitor-select"
            title="Preview Zoom scale"
          >
            <option value="fit">Fit Viewport</option>
            <option value="0.5">50% Scale</option>
            <option value="1.0">100% Native</option>
          </select>
        </div>
      </div>

      {/* Canvas Viewport Container */}
      <div className="nle-canvas-stage">
        <div
          className="canvas-aspect-box"
          style={{
            maxWidth: zoomScale === 'fit' ? '100%' : `${zoomScale * 100}%`,
            aspectRatio: `${project.width} / ${project.height}`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={project.width}
            height={project.height}
            className={`nle-canvas ${isDraggingCanvas ? 'dragging' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          />
        </div>
      </div>

      {/* Transport Control Bar */}
      <div className="nle-transport-bar">
        {/* Timecode readouts */}
        <div className="transport-timecode-box">
          <span className="timecode-current" title="Current Playhead SMPTE Timecode">
            {timecodeDisplay}
          </span>
          <span className="timecode-divider">/</span>
          <span className="timecode-total" title="Total Sequence Duration">
            {totalDurationDisplay}
          </span>
        </div>

        {/* Transport buttons */}
        <div className="transport-buttons">
          <button
            onClick={jumpToStart}
            className="transport-btn"
            title="Jump to Start (Home)"
            aria-label="Jump to sequence start"
          >
            <SkipBack size={15} />
          </button>

          <button
            onClick={() => stepFrame(-1)}
            className="transport-btn"
            title="Step 1 Frame Back (Left Arrow)"
            aria-label="Step 1 frame backward"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={togglePlay}
            className={`transport-btn-play ${isPlaying ? 'playing' : ''}`}
            title="Play / Pause (Space)"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: 2 }} />}
          </button>

          <button
            onClick={() => stepFrame(1)}
            className="transport-btn"
            title="Step 1 Frame Forward (Right Arrow)"
            aria-label="Step 1 frame forward"
          >
            <ChevronRight size={16} />
          </button>

          <button
            onClick={jumpToEnd}
            className="transport-btn"
            title="Jump to End (End)"
            aria-label="Jump to sequence end"
          >
            <SkipForward size={15} />
          </button>
        </div>

        {/* Frame index indicator */}
        <div className="transport-frame-box">
          <span>Frame {currentFrame}</span>
        </div>
      </div>
    </div>
  );
};
