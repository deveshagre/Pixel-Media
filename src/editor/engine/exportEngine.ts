import { TimelineProject, ExportSettings } from '../types';
import { renderFrameToCanvas } from './renderer';

export interface ExportProgress {
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  status: 'rendering' | 'encoding' | 'completed' | 'cancelled' | 'error';
  errorMessage?: string;
}

export interface SupportedFormats {
  mp4: boolean;
  webm: boolean;
  mimeType: string;
  extension: 'mp4' | 'webm';
}

/**
 * Detect runtime container and codec support for MediaRecorder
 */
export const detectSupportedExportFormats = (): SupportedFormats => {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return {
      mp4: false,
      webm: false,
      mimeType: 'video/webm',
      extension: 'webm',
    };
  }

  const mp4Types = [
    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4;codecs=h264',
    'video/mp4',
  ];

  const webmTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
  ];

  let supportedMp4 = '';
  for (const t of mp4Types) {
    if (MediaRecorder.isTypeSupported(t)) {
      supportedMp4 = t;
      break;
    }
  }

  let supportedWebm = '';
  for (const t of webmTypes) {
    if (MediaRecorder.isTypeSupported(t)) {
      supportedWebm = t;
      break;
    }
  }

  if (supportedMp4) {
    return {
      mp4: true,
      webm: Boolean(supportedWebm),
      mimeType: supportedMp4,
      extension: 'mp4',
    };
  }

  return {
    mp4: false,
    webm: Boolean(supportedWebm),
    mimeType: supportedWebm || 'video/webm',
    extension: 'webm',
  };
};

export class ExportCancellation {
  public isCancelled = false;
  public cancel(): void {
    this.isCancelled = true;
  }
}

/**
 * Executes a deterministic frame-by-frame export into a downloadable video file.
 */
export const renderAndExportVideo = async (
  project: TimelineProject,
  settings: ExportSettings,
  onProgress: (progress: ExportProgress) => void,
  cancellation: ExportCancellation
): Promise<{ blob: Blob; filename: string; extension: string }> => {
  const supported = detectSupportedExportFormats();
  const formatChoice = settings.format === 'mp4' && supported.mp4 ? 'mp4' : 'webm';
  const mimeType = formatChoice === 'mp4' ? (supported.mp4 ? supported.mimeType : 'video/webm') : (supported.webm ? supported.mimeType : 'video/webm');
  const extension = formatChoice === 'mp4' && supported.mp4 ? 'mp4' : 'webm';

  const exportW = settings.resolution.width;
  const exportH = settings.resolution.height;
  const totalFrames = project.durationFrames;
  const fps = settings.fps || project.fps || 30;

  // Create offline canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = exportW;
  canvas.height = exportH;
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!ctx) {
    throw new Error('Unable to initialize 2D context for offline rendering.');
  }

  // Pre-load visual assets for seeking
  const mediaElementsMap = new Map<string, HTMLVideoElement | HTMLImageElement>();
  for (const asset of project.assets) {
    if (asset.type === 'image') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = asset.url;
      await new Promise((resolve) => {
        if (img.complete) resolve(true);
        else {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
        }
      });
      mediaElementsMap.set(asset.id, img);
    } else if (asset.type === 'video') {
      const vid = document.createElement('video');
      vid.crossOrigin = 'anonymous';
      vid.muted = true;
      vid.playsInline = true;
      vid.src = asset.url;
      await new Promise((resolve) => {
        vid.onloadedmetadata = () => resolve(true);
        vid.onerror = () => resolve(false);
        setTimeout(() => resolve(false), 2000); // 2s timeout fallback
      });
      mediaElementsMap.set(asset.id, vid);
    }
  }

  // Setup stream capture from canvas
  const stream = canvas.captureStream(fps);
  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: settings.bitrate || 6_000_000,
    });
  } catch {
    // Fallback to default options
    recorder = new MediaRecorder(stream);
  }

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.start();

  // Scale if export resolution differs from project resolution
  const scaleX = exportW / project.width;
  const scaleY = exportH / project.height;

  // Frame-by-frame rendering loop with yield
  for (let frame = 0; frame < totalFrames; frame++) {
    if (cancellation.isCancelled) {
      recorder.stop();
      onProgress({
        currentFrame: frame,
        totalFrames,
        percentage: Math.round((frame / totalFrames) * 100),
        status: 'cancelled',
      });
      throw new Error('Export cancelled by user.');
    }

    // Seek all active video elements
    for (const clip of project.clips) {
      if (clip.assetId && (clip.type === 'video')) {
        const vid = mediaElementsMap.get(clip.assetId);
        if (vid && vid instanceof HTMLVideoElement) {
          const isActive = frame >= clip.startFrame && frame < clip.startFrame + clip.durationFrames;
          if (isActive) {
            const offset = frame - clip.startFrame;
            const targetSec = (clip.sourceInFrame + offset * (clip.speed || 1.0)) / project.fps;
            vid.currentTime = targetSec;
          }
        }
      }
    }

    // Render frame
    ctx.save();
    if (scaleX !== 1 || scaleY !== 1) {
      ctx.scale(scaleX, scaleY);
    }
    renderFrameToCanvas(ctx, project, frame, mediaElementsMap, { drawSelectionOutline: false });
    ctx.restore();

    onProgress({
      currentFrame: frame + 1,
      totalFrames,
      percentage: Math.round(((frame + 1) / totalFrames) * 100),
      status: 'rendering',
    });

    // Yield control to UI thread every frame to maintain responsiveness
    await new Promise((resolve) => setTimeout(resolve, 1000 / fps));
  }

  onProgress({
    currentFrame: totalFrames,
    totalFrames,
    percentage: 100,
    status: 'encoding',
  });

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const finalBlob = new Blob(chunks, { type: mimeType });
      const sanitizedName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${sanitizedName}_${exportW}x${exportH}.${extension}`;

      onProgress({
        currentFrame: totalFrames,
        totalFrames,
        percentage: 100,
        status: 'completed',
      });

      resolve({
        blob: finalBlob,
        filename,
        extension,
      });
    };

    recorder.onerror = (err) => {
      reject(new Error(`MediaRecorder error: ${err}`));
    };

    recorder.stop();
  });
};

/**
 * Triggers browser download for an exported video Blob
 */
export const downloadVideoBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
