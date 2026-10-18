export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9';

export interface Resolution {
  width: number;
  height: number;
}

export const ASPECT_RATIO_RESOLUTIONS: Record<AspectRatio, Resolution> = {
  '16:9': { width: 1920, height: 1080 },
  '9:16': { width: 1080, height: 1920 },
  '1:1': { width: 1080, height: 1080 },
  '4:5': { width: 1080, height: 1350 },
  '21:9': { width: 2560, height: 1080 },
};

export type MediaType = 'video' | 'audio' | 'image';
export type TrackType = 'video' | 'audio' | 'text' | 'shape';
export type ClipType = 'video' | 'audio' | 'text' | 'shape' | 'image';
export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaType;
  url: string;
  durationFrames: number;
  width?: number;
  height?: number;
  fps?: number;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Keyframe {
  id: string;
  frame: number;
  value: number;
  easing: EasingType;
}

export interface ClipTransform {
  x: number;          // Offset in canvas pixels relative to center
  y: number;          // Offset in canvas pixels relative to center
  scale: number;      // Scale multiplier (1.0 = 100%)
  rotation: number;   // Degrees (0 - 360)
  opacity: number;    // 0.0 - 1.0
}

export interface TextConfig {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  strokeColor?: string;
  strokeWidth?: number;
  backgroundColor?: string;
  align: 'left' | 'center' | 'right';
  shadowColor?: string;
  shadowBlur?: number;
  lineHeight?: number;
  letterSpacing?: number;
  presetStyle?: 'kinetic' | 'lower_third' | 'minimal' | 'headline' | 'caption';
}

export interface ShapeConfig {
  shapeType: 'rectangle' | 'circle' | 'pill' | 'banner';
  fill: string;
  stroke: string;
  strokeWidth: number;
  width: number;
  height: number;
  borderRadius?: number;
}

export interface AudioConfig {
  volume: number;       // 0.0 - 2.0 (1.0 = 100%)
  fadeInFrames: number; // Duration of fade-in
  fadeOutFrames: number;// Duration of fade-out
  muted: boolean;
}

export interface TimelineClip {
  id: string;
  trackId: string;
  assetId?: string;       // Linked media asset if video/audio/image
  name: string;
  type: ClipType;
  startFrame: number;     // Absolute start frame on timeline
  durationFrames: number; // Length in timeline frames
  sourceInFrame: number;  // In-point within the source media asset
  sourceOutFrame: number; // Out-point within the source media asset
  speed: number;          // 0.5x, 1.0x, 2.0x, etc.
  
  transform: ClipTransform;
  textConfig?: TextConfig;
  shapeConfig?: ShapeConfig;
  audioConfig?: AudioConfig;
  
  // Keyframed animated properties
  keyframes?: {
    x?: Keyframe[];
    y?: Keyframe[];
    scale?: Keyframe[];
    rotation?: Keyframe[];
    opacity?: Keyframe[];
    volume?: Keyframe[];
  };
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: TrackType;
  order: number;
  muted: boolean;
  locked: boolean;
  visible: boolean;
  volume: number;
}

export interface TimelineProject {
  schemaVersion: number;
  id: string;
  name: string;
  fps: number;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  durationFrames: number;
  backgroundColor: string;
  tracks: TimelineTrack[];
  clips: TimelineClip[];
  assets: MediaAsset[];
  createdAt: string;
  updatedAt: string;
}

export type EditorTool = 'select' | 'razor' | 'trim';

export interface ExportSettings {
  format: 'mp4' | 'webm';
  resolution: Resolution;
  aspectRatio: AspectRatio;
  fps: number;
  bitrate: number; // in bps
  quality: 'high' | 'standard' | 'fast';
}
