import { TimelineProject, MediaAsset } from '../types';

export type FrameCallback = (frame: number) => void;
export type StateCallback = (isPlaying: boolean) => void;

export class PlaybackEngine {
  private project: TimelineProject;
  private currentFrame = 0;
  private isPlaying = false;
  private animFrameId: number | null = null;
  private lastTime = 0;
  private frameAccumulator = 0;

  private mediaElements = new Map<string, HTMLVideoElement | HTMLImageElement>();
  private audioElements = new Map<string, HTMLAudioElement>();
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private frameListeners: Set<FrameCallback> = new Set();
  private stateListeners: Set<StateCallback> = new Set();
  private mediaLoadedListeners: Set<() => void> = new Set();

  constructor(project: TimelineProject) {
    this.project = project;
    this.preloadAssets(project.assets);
  }

  public updateProject(project: TimelineProject): void {
    this.project = project;
    this.preloadAssets(project.assets);
    if (this.currentFrame >= project.durationFrames) {
      this.seekToFrame(Math.max(0, project.durationFrames - 1));
    }
  }

  public preloadAssets(assets: MediaAsset[]): void {
    if (typeof window === 'undefined') return;
    for (const asset of assets) {
      if (this.mediaElements.has(asset.id)) continue;
      if (asset.type === 'image') {
        const img = new Image();
        if (asset.url.startsWith('http://') || asset.url.startsWith('https://')) {
          img.crossOrigin = 'anonymous';
        }
        img.src = asset.url;
        img.onload = () => {
          this.notifyMediaLoaded();
          this.notifyFrame();
        };
        img.onerror = () => {
          if (img.crossOrigin) {
            img.crossOrigin = null;
            img.src = asset.url;
          }
        };
        this.mediaElements.set(asset.id, img);
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
          this.notifyMediaLoaded();
          this.notifyFrame();
        };
        this.mediaElements.set(asset.id, video);
      }
    }
  }

  public getCurrentFrame(): number {
    return this.currentFrame;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public registerMediaElement(assetId: string, el: HTMLVideoElement | HTMLImageElement): void {
    this.mediaElements.set(assetId, el);
    this.notifyMediaLoaded();
  }

  public getMediaElements(): Map<string, HTMLVideoElement | HTMLImageElement> {
    return this.mediaElements;
  }

  public subscribeFrame(cb: FrameCallback): () => void {
    this.frameListeners.add(cb);
    return () => this.frameListeners.delete(cb);
  }

  public subscribeState(cb: StateCallback): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  public subscribeMediaLoaded(cb: () => void): () => void {
    this.mediaLoadedListeners.add(cb);
    return () => this.mediaLoadedListeners.delete(cb);
  }

  public notifyMediaLoaded(): void {
    for (const listener of this.mediaLoadedListeners) {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying media listener:', err);
      }
    }
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public play(): void {
    if (this.isPlaying) return;
    this.initAudio();

    // If at end of sequence, loop to beginning
    if (this.currentFrame >= this.project.durationFrames - 1) {
      this.currentFrame = 0;
    }

    this.isPlaying = true;
    this.lastTime = performance.now();
    this.frameAccumulator = 0;
    this.notifyState();

    this.syncMediaElements(true);
    this.tick();
  }

  public pause(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.notifyState();
    this.syncMediaElements(false);
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public seekToFrame(targetFrame: number): void {
    const clamped = Math.max(0, Math.min(this.project.durationFrames - 1, Math.round(targetFrame)));
    this.currentFrame = clamped;
    this.syncMediaElements(this.isPlaying);
    this.notifyFrame();
  }

  public stepFrame(delta: number): void {
    this.pause();
    this.seekToFrame(this.currentFrame + delta);
  }

  public jumpToStart(): void {
    this.pause();
    this.seekToFrame(0);
  }

  public jumpToEnd(): void {
    this.pause();
    this.seekToFrame(this.project.durationFrames - 1);
  }

  private tick = (): void => {
    if (!this.isPlaying) return;

    const now = performance.now();
    const deltaMs = now - this.lastTime;
    this.lastTime = now;

    const fps = this.project.fps || 30;
    const msPerFrame = 1000 / fps;

    this.frameAccumulator += deltaMs;

    let framesToAdvance = 0;
    while (this.frameAccumulator >= msPerFrame) {
      framesToAdvance++;
      this.frameAccumulator -= msPerFrame;
    }

    if (framesToAdvance > 0) {
      const nextFrame = this.currentFrame + framesToAdvance;
      if (nextFrame >= this.project.durationFrames) {
        // Stop or loop at end
        this.currentFrame = 0; // Loop seamlessly for editing
        this.notifyFrame();
        this.syncMediaElements(true);
      } else {
        this.currentFrame = nextFrame;
        this.notifyFrame();
        this.syncMediaElements(true);
      }
    }

    this.animFrameId = requestAnimationFrame(this.tick);
  };

  /**
   * Keep underlying HTML5 video and audio elements in frame sync
   */
  private syncMediaElements(shouldPlay: boolean): void {
    const fps = this.project.fps || 30;

    for (const clip of this.project.clips) {
      if (!clip.assetId) continue;
      const el = this.mediaElements.get(clip.assetId);
      if (!el || !(el instanceof HTMLVideoElement)) continue;

      const isClipActive =
        this.currentFrame >= clip.startFrame &&
        this.currentFrame < clip.startFrame + clip.durationFrames;

      if (isClipActive) {
        const offsetFrames = this.currentFrame - clip.startFrame;
        const sourceFrame = clip.sourceInFrame + offsetFrames * (clip.speed || 1.0);
        const targetSeconds = sourceFrame / fps;

        // Apply drift correction if out of sync by > 0.15s
        if (Math.abs(el.currentTime - targetSeconds) > 0.15) {
          try {
            el.currentTime = targetSeconds;
          } catch {
            // ignore
          }
        }

        if (shouldPlay && el.paused) {
          el.play().catch(() => {});
        } else if (!shouldPlay && !el.paused) {
          el.pause();
        }
      } else {
        if (!el.paused) {
          el.pause();
        }
      }
    }
  }

  private notifyFrame(): void {
    for (const listener of this.frameListeners) {
      listener(this.currentFrame);
    }
  }

  private notifyState(): void {
    for (const listener of this.stateListeners) {
      listener(this.isPlaying);
    }
  }

  public destroy(): void {
    this.pause();
    this.frameListeners.clear();
    this.stateListeners.clear();
    this.mediaElements.clear();
    this.audioElements.clear();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close().catch(() => {});
    }
  }
}
