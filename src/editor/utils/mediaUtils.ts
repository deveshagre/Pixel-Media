import { MediaAsset, MediaType } from '../types';
import { secondsToFrames } from './timecode';

/**
 * Determine media type from MIME type or file extension
 */
export const detectMediaType = (file: File): MediaType | null => {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  if (file.type.startsWith('image/')) return 'image';

  const ext = file.name.split('.').pop()?.toLowerCase();
  if (['mp4', 'mov', 'webm', 'mkv', 'm4v'].includes(ext || '')) return 'video';
  if (['mp3', 'wav', 'aac', 'ogg', 'm4a'].includes(ext || '')) return 'audio';
  if (['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext || '')) return 'image';

  return null;
};

/**
 * Extract metadata and generate thumbnail for an imported File
 */
export const processImportedFile = async (
  file: File,
  fps = 30
): Promise<MediaAsset> => {
  const mediaType = detectMediaType(file);
  if (!mediaType) {
    throw new Error(`Unsupported media format: ${file.name}`);
  }

  const objectUrl = URL.createObjectURL(file);
  const id = `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  if (mediaType === 'image') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          id,
          name: file.name,
          type: 'image',
          url: objectUrl,
          durationFrames: fps * 5, // default 5s for still images
          width: img.naturalWidth,
          height: img.naturalHeight,
          fileSize: file.size,
          mimeType: file.type,
          thumbnailUrl: objectUrl,
          createdAt: new Date().toISOString(),
        });
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = objectUrl;
    });
  }

  if (mediaType === 'video') {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        const durationSec = isFinite(video.duration) ? video.duration : 10;
        // Seek to half duration or 1s for thumbnail extraction
        video.currentTime = Math.min(1.0, durationSec / 2);
      };

      video.onseeked = () => {
        let thumbUrl = '';
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 160;
          canvas.height = 90;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            thumbUrl = canvas.toDataURL('image/jpeg', 0.7);
          }
        } catch {
          // fallback
          thumbUrl = '';
        }

        resolve({
          id,
          name: file.name,
          type: 'video',
          url: objectUrl,
          durationFrames: Math.max(1, secondsToFrames(video.duration || 10, fps)),
          width: video.videoWidth || 1920,
          height: video.videoHeight || 1080,
          fps,
          fileSize: file.size,
          mimeType: file.type,
          thumbnailUrl: thumbUrl || undefined,
          createdAt: new Date().toISOString(),
        });
      };

      video.onerror = () => {
        // Fallback resolve with estimates
        resolve({
          id,
          name: file.name,
          type: 'video',
          url: objectUrl,
          durationFrames: fps * 10,
          width: 1920,
          height: 1080,
          fps,
          fileSize: file.size,
          mimeType: file.type,
          createdAt: new Date().toISOString(),
        });
      };

      video.src = objectUrl;
    });
  }

  // Audio file
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';

    audio.onloadedmetadata = () => {
      const durationSec = isFinite(audio.duration) ? audio.duration : 15;
      resolve({
        id,
        name: file.name,
        type: 'audio',
        url: objectUrl,
        durationFrames: Math.max(1, secondsToFrames(durationSec, fps)),
        fileSize: file.size,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
      });
    };

    audio.onerror = () => {
      resolve({
        id,
        name: file.name,
        type: 'audio',
        url: objectUrl,
        durationFrames: fps * 15,
        fileSize: file.size,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
      });
    };

    audio.src = objectUrl;
  });
};
