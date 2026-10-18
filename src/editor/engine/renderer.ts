import { TimelineProject, TimelineClip, TextConfig, ShapeConfig } from '../types';
import { interpolateProperty } from '../utils/interpolation';

export interface RenderFrameOptions {
  selectedClipId?: string | null;
  drawSelectionOutline?: boolean;
  onMediaLoaded?: () => void;
}

/**
 * Deterministic frame-by-frame canvas renderer.
 * Shared between the interactive preview canvas and the offline video export pipeline.
 */
export const renderFrameToCanvas = (
  ctx: CanvasRenderingContext2D,
  project: TimelineProject,
  currentFrame: number,
  mediaElementsMap: Map<string, HTMLVideoElement | HTMLImageElement>,
  options: RenderFrameOptions = {}
): void => {
  const { width, height, backgroundColor, tracks, clips } = project;

  // Clear canvas
  ctx.save();
  ctx.fillStyle = backgroundColor || '#000000';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Sort tracks bottom-up (higher order index rendered first, or lower order index first depending on convention)
  // Standard NLE: Track order 0 is at the top of timeline UI (highest visual layer),
  // so we render tracks with higher order numbers first (backgrounds), and track 0 last (foreground).
  const sortedTracks = [...tracks].sort((a, b) => b.order - a.order);

  for (const track of sortedTracks) {
    if (!track.visible) continue;

    // Find clips on this track active at the current frame
    const activeClips = clips.filter(
      (c) =>
        c.trackId === track.id &&
        currentFrame >= c.startFrame &&
        currentFrame < c.startFrame + c.durationFrames
    );

    for (const clip of activeClips) {
      renderClip(ctx, clip, currentFrame, width, height, mediaElementsMap, project, options);
    }
  }
};

const renderClip = (
  ctx: CanvasRenderingContext2D,
  clip: TimelineClip,
  currentFrame: number,
  canvasWidth: number,
  canvasHeight: number,
  mediaElementsMap: Map<string, HTMLVideoElement | HTMLImageElement>,
  project: TimelineProject,
  options: RenderFrameOptions
) => {
  // Calculate interpolated values for transform
  const posX = interpolateProperty(clip.keyframes?.x, currentFrame, clip.transform.x);
  const posY = interpolateProperty(clip.keyframes?.y, currentFrame, clip.transform.y);
  const scale = interpolateProperty(clip.keyframes?.scale, currentFrame, clip.transform.scale);
  const rotation = interpolateProperty(clip.keyframes?.rotation, currentFrame, clip.transform.rotation);
  const opacity = Math.max(0, Math.min(1, interpolateProperty(clip.keyframes?.opacity, currentFrame, clip.transform.opacity)));

  if (opacity <= 0.001) return;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Move origin to center of canvas + offset
  const centerX = canvasWidth / 2 + posX;
  const centerY = canvasHeight / 2 + posY;
  ctx.translate(centerX, centerY);

  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }

  if (scale !== 1) {
    ctx.scale(scale, scale);
  }

  let boundsWidth = 0;
  let boundsHeight = 0;

  // Render according to clip type
  if (clip.type === 'video' || clip.type === 'image') {
    let assetEl = clip.assetId ? mediaElementsMap.get(clip.assetId) : null;
    if (!assetEl && clip.assetId) {
      const asset = project.assets.find((a) => a.id === clip.assetId);
      if (asset && typeof window !== 'undefined') {
        if (asset.type === 'image') {
          const img = new Image();
          if (asset.url.startsWith('http://') || asset.url.startsWith('https://')) {
            img.crossOrigin = 'anonymous';
          }
          img.src = asset.url;
          img.onload = () => {
            options.onMediaLoaded?.();
          };
          img.onerror = () => {
            if (img.crossOrigin) {
              img.crossOrigin = null;
              img.src = asset.url;
            }
          };
          mediaElementsMap.set(asset.id, img);
          assetEl = img;
        } else if (asset.type === 'video') {
          const video = document.createElement('video');
          if (asset.url.startsWith('http://') || asset.url.startsWith('https://')) {
            video.crossOrigin = 'anonymous';
          }
          video.muted = true;
          video.playsInline = true;
          video.preload = 'auto';
          video.src = asset.url;
          video.onloadeddata = () => {
            options.onMediaLoaded?.();
          };
          mediaElementsMap.set(asset.id, video);
          assetEl = video;
        }
      }
    }

    const isImage = typeof HTMLImageElement !== 'undefined' && assetEl instanceof HTMLImageElement;
    const isVideo = typeof HTMLVideoElement !== 'undefined' && assetEl instanceof HTMLVideoElement;

    const isImageReady = Boolean(isImage && (assetEl as HTMLImageElement).complete && (assetEl as HTMLImageElement).naturalWidth > 0);
    const isVideoReady = Boolean(isVideo && ((assetEl as HTMLVideoElement).readyState >= 1 || (assetEl as HTMLVideoElement).videoWidth > 0));

    // If media element was already cached but is still downloading, attach onMediaLoaded callback
    if (isImage && !isImageReady && options.onMediaLoaded) {
      const imgEl = assetEl as HTMLImageElement;
      const prevOnload = imgEl.onload;
      imgEl.onload = (ev) => {
        if (typeof prevOnload === 'function') prevOnload.call(imgEl, ev);
        options.onMediaLoaded?.();
      };
      const prevOnerror = imgEl.onerror;
      imgEl.onerror = (ev) => {
        if (typeof prevOnerror === 'function') prevOnerror.call(imgEl, ev);
        if (imgEl.crossOrigin) {
          imgEl.crossOrigin = null;
          imgEl.src = imgEl.src;
        }
      };
    } else if (isVideo && !isVideoReady && options.onMediaLoaded) {
      const videoEl = assetEl as HTMLVideoElement;
      const prevOnloaded = videoEl.onloadeddata;
      videoEl.onloadeddata = (ev) => {
        if (typeof prevOnloaded === 'function') prevOnloaded.call(videoEl, ev);
        options.onMediaLoaded?.();
      };
    }

    if (assetEl && (isImageReady || isVideoReady)) {
      const srcW = (assetEl as HTMLVideoElement).videoWidth || (assetEl as HTMLImageElement).naturalWidth || canvasWidth;
      const srcH = (assetEl as HTMLVideoElement).videoHeight || (assetEl as HTMLImageElement).naturalHeight || canvasHeight;

      // Fit aspect inside canvas bounds while keeping aspect ratio
      const aspect = srcW / srcH;
      let drawW = canvasWidth;
      let drawH = canvasWidth / aspect;

      if (drawH > canvasHeight) {
        drawH = canvasHeight;
        drawW = canvasHeight * aspect;
      }

      boundsWidth = drawW;
      boundsHeight = drawH;

      ctx.drawImage(assetEl, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      // Placeholder if asset is still loading
      boundsWidth = canvasWidth * 0.85;
      boundsHeight = canvasHeight * 0.85;
      ctx.fillStyle = '#0c0d12';
      ctx.fillRect(-boundsWidth / 2, -boundsHeight / 2, boundsWidth, boundsHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(-boundsWidth / 2, -boundsHeight / 2, boundsWidth, boundsHeight);
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Loading footage: ${clip.name}...`, 0, 0);
    }
  } else if (clip.type === 'text' && clip.textConfig) {
    const bounds = renderTextClip(ctx, clip.textConfig);
    boundsWidth = bounds.width;
    boundsHeight = bounds.height;
  } else if (clip.type === 'shape' && clip.shapeConfig) {
    const bounds = renderShapeClip(ctx, clip.shapeConfig);
    boundsWidth = bounds.width;
    boundsHeight = bounds.height;
  }

  // Draw selection bounding outline and anchor handles if active
  if (options.drawSelectionOutline && options.selectedClipId === clip.id && boundsWidth > 0 && boundsHeight > 0) {
    ctx.save();
    ctx.strokeStyle = '#e4b363';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    const pad = 8;
    ctx.strokeRect(-boundsWidth / 2 - pad, -boundsHeight / 2 - pad, boundsWidth + pad * 2, boundsHeight + pad * 2);

    // Corner handles
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    const handleSize = 7;
    const corners = [
      { x: -boundsWidth / 2 - pad, y: -boundsHeight / 2 - pad },
      { x: boundsWidth / 2 + pad, y: -boundsHeight / 2 - pad },
      { x: -boundsWidth / 2 - pad, y: boundsHeight / 2 + pad },
      { x: boundsWidth / 2 + pad, y: boundsHeight / 2 + pad },
    ];
    for (const c of corners) {
      ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
    }
    ctx.restore();
  }

  ctx.restore();
};

const renderTextClip = (ctx: CanvasRenderingContext2D, cfg: TextConfig): { width: number; height: number } => {
  const fontStyle = `${cfg.fontWeight || '700'} ${cfg.fontSize || 48}px ${cfg.fontFamily || 'Inter, sans-serif'}`;
  ctx.font = fontStyle;
  ctx.textAlign = cfg.align || 'center';
  ctx.textBaseline = 'middle';

  // Shadow
  if (cfg.shadowBlur && cfg.shadowBlur > 0) {
    ctx.shadowColor = cfg.shadowColor || 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = cfg.shadowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  }

  const lines = (cfg.text || '').split('\n');
  const lineHeight = cfg.fontSize * (cfg.lineHeight || 1.25);
  const totalHeight = lines.length * lineHeight;

  let maxWidth = 0;
  for (const line of lines) {
    const metrics = ctx.measureText(line);
    if (metrics.width > maxWidth) {
      maxWidth = metrics.width;
    }
  }

  const startY = -(totalHeight / 2) + lineHeight / 2;

  lines.forEach((line, idx) => {
    const curY = startY + idx * lineHeight;

    // Optional background pill/box
    if (cfg.backgroundColor) {
      const lineMetrics = ctx.measureText(line);
      const bgPadX = 14;
      const bgPadY = 6;
      ctx.save();
      ctx.fillStyle = cfg.backgroundColor;
      ctx.fillRect(-lineMetrics.width / 2 - bgPadX, curY - lineHeight / 2 - bgPadY, lineMetrics.width + bgPadX * 2, lineHeight + bgPadY * 2);
      ctx.restore();
    }

    // Stroke
    if (cfg.strokeWidth && cfg.strokeWidth > 0 && cfg.strokeColor) {
      ctx.strokeStyle = cfg.strokeColor;
      ctx.lineWidth = cfg.strokeWidth;
      ctx.strokeText(line, 0, curY);
    }

    // Fill
    ctx.fillStyle = cfg.color || '#ffffff';
    ctx.fillText(line, 0, curY);
  });

  return { width: maxWidth, height: totalHeight };
};

const renderShapeClip = (ctx: CanvasRenderingContext2D, cfg: ShapeConfig): { width: number; height: number } => {
  const w = cfg.width || 300;
  const h = cfg.height || 100;
  const halfW = w / 2;
  const halfH = h / 2;

  ctx.fillStyle = cfg.fill || '#e4b363';

  if (cfg.shapeType === 'circle') {
    const r = Math.min(w, h) / 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    if (cfg.strokeWidth > 0) {
      ctx.strokeStyle = cfg.stroke;
      ctx.lineWidth = cfg.strokeWidth;
      ctx.stroke();
    }
    return { width: r * 2, height: r * 2 };
  }

  if (cfg.shapeType === 'pill') {
    const r = halfH;
    ctx.beginPath();
    ctx.roundRect(-halfW, -halfH, w, h, r);
    ctx.fill();
    if (cfg.strokeWidth > 0) {
      ctx.strokeStyle = cfg.stroke;
      ctx.lineWidth = cfg.strokeWidth;
      ctx.stroke();
    }
    return { width: w, height: h };
  }

  // Rectangle / Banner
  ctx.beginPath();
  const radius = cfg.borderRadius || 4;
  ctx.roundRect(-halfW, -halfH, w, h, radius);
  ctx.fill();
  if (cfg.strokeWidth > 0) {
    ctx.strokeStyle = cfg.stroke;
    ctx.lineWidth = cfg.strokeWidth;
    ctx.stroke();
  }

  return { width: w, height: h };
};
