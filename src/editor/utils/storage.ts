import { TimelineProject, TimelineTrack, TimelineClip, MediaAsset } from '../types';

const STORAGE_PREFIX = 'pixel_project_';
const RECENT_PROJECT_KEY = 'pixel_recent_project_id';
const PROJECT_LIST_KEY = 'pixel_project_index';

export const createDefaultProject = (name = 'Pixel Media Creative Sequence'): TimelineProject => {
  const defaultTracks: TimelineTrack[] = [
    {
      id: 'track-t1',
      name: 'T1 • Headline Text',
      type: 'text',
      order: 0,
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
    },
    {
      id: 'track-t2',
      name: 'T2 • Supporting Text',
      type: 'text',
      order: 1,
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
    },
    {
      id: 'track-v1',
      name: 'V1 • Showreel Media',
      type: 'video',
      order: 2,
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
    },
    {
      id: 'track-a1',
      name: 'A1 • Master Audio',
      type: 'audio',
      order: 3,
      muted: false,
      locked: false,
      visible: true,
      volume: 1.0,
    },
  ];

  const defaultAssets: MediaAsset[] = [
    {
      id: 'asset-esports-showreel',
      name: 'VCT_Championship_Finals_Showreel.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 600,
      width: 1920,
      height: 1080,
      fps: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=85',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'footage-esports-final',
      name: 'VCT Championship — Grand Finals Reel',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 600,
      width: 1920,
      height: 1080,
      fps: 60,
      thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=85',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'asset-sample-cyber',
      name: 'Horizon_Automotive_Broadcast.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 600,
      width: 1920,
      height: 1080,
      fps: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=85',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'footage-horizon-auto',
      name: 'Apex Horizon — Supercar Track Anthem',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 600,
      width: 1920,
      height: 1080,
      fps: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=85',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'asset-sample-urban',
      name: 'Luminary_Autumn_Editorial.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 600,
      width: 1920,
      height: 1080,
      fps: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=300&q=85',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'footage-luminary-fashion',
      name: 'Vogue Luminary — Autumn Cover Master',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 540,
      width: 1920,
      height: 1080,
      fps: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=300&q=85',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'footage-tokyo-neon',
      name: 'Tokyo Night Streets — Cyber Neon RAW',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 600,
      width: 1920,
      height: 1080,
      fps: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'footage-synthetix-3d',
      name: 'Synthetix 3D — Holographic Particles',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 600,
      width: 1920,
      height: 1080,
      fps: 60,
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'footage-nordic-aerial',
      name: 'Nordic Horizons — Cinematic Drone Aerial',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 720,
      width: 1920,
      height: 1080,
      fps: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'footage-kinetic-skate',
      name: 'Kinetic Velocity — Street Action Reel',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 450,
      width: 1920,
      height: 1080,
      fps: 60,
      thumbnailUrl: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'footage-cyber-grid',
      name: 'Cyber Grid — High Speed Motion Title',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=85',
      durationFrames: 480,
      width: 1920,
      height: 1080,
      fps: 30,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultClips: TimelineClip[] = [
    {
      id: 'clip-hero-media',
      trackId: 'track-v1',
      assetId: 'footage-horizon-auto',
      name: 'Apex Horizon — Supercar Track Anthem',
      type: 'image',
      startFrame: 0,
      durationFrames: 600, // 20 seconds
      sourceInFrame: 0,
      sourceOutFrame: 600,
      speed: 1.0,
      transform: {
        x: 0,
        y: 0,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
      },
      keyframes: {
        scale: [
          { id: 'kf-m-sc1', frame: 0, value: 1.0, easing: 'linear' },
          { id: 'kf-m-sc2', frame: 300, value: 1.05, easing: 'ease-in-out' },
          { id: 'kf-m-sc3', frame: 600, value: 1.1, easing: 'linear' },
        ],
      },
    },
    {
      id: 'clip-hero-headline',
      trackId: 'track-t1',
      name: 'Make every frame count.',
      type: 'text',
      startFrame: 0,
      durationFrames: 600,
      sourceInFrame: 0,
      sourceOutFrame: 600,
      speed: 1.0,
      transform: {
        x: 0,
        y: -45,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
      },
      textConfig: {
        text: 'Make every frame count.',
        fontFamily: 'Inter, sans-serif',
        fontSize: 54,
        fontWeight: '800',
        color: '#ffffff',
        align: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.9)',
        shadowBlur: 20,
        lineHeight: 1.15,
        presetStyle: 'kinetic',
      },
      keyframes: {
        opacity: [
          { id: 'kf-h-op1', frame: 0, value: 0, easing: 'ease-out' },
          { id: 'kf-h-op2', frame: 25, value: 1, easing: 'linear' },
          { id: 'kf-h-op3', frame: 580, value: 1, easing: 'ease-in' },
          { id: 'kf-h-op4', frame: 600, value: 0, easing: 'linear' },
        ],
        y: [
          { id: 'kf-h-y1', frame: 0, value: -20, easing: 'ease-out' },
          { id: 'kf-h-y2', frame: 30, value: -45, easing: 'ease-in-out' },
        ],
        scale: [
          { id: 'kf-h-sc1', frame: 0, value: 0.95, easing: 'ease-out' },
          { id: 'kf-h-sc2', frame: 35, value: 1.0, easing: 'linear' },
        ],
      },
    },
    {
      id: 'clip-hero-subtitle',
      trackId: 'track-t2',
      name: 'Thoughtful editing, striking visuals',
      type: 'text',
      startFrame: 10,
      durationFrames: 590,
      sourceInFrame: 0,
      sourceOutFrame: 590,
      speed: 1.0,
      transform: {
        x: 0,
        y: 55,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
      },
      textConfig: {
        text: 'Thoughtful editing, striking visuals, and motion that brings your ideas to life.',
        fontFamily: 'Inter, sans-serif',
        fontSize: 20,
        fontWeight: '400',
        color: '#d4d4d8',
        align: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.9)',
        shadowBlur: 14,
        lineHeight: 1.35,
        presetStyle: 'minimal',
      },
      keyframes: {
        opacity: [
          { id: 'kf-s-op1', frame: 10, value: 0, easing: 'ease-out' },
          { id: 'kf-s-op2', frame: 35, value: 1, easing: 'linear' },
          { id: 'kf-s-op3', frame: 575, value: 1, easing: 'ease-in' },
          { id: 'kf-s-op4', frame: 600, value: 0, easing: 'linear' },
        ],
        y: [
          { id: 'kf-s-y1', frame: 10, value: 75, easing: 'ease-out' },
          { id: 'kf-s-y2', frame: 40, value: 55, easing: 'ease-in-out' },
        ],
      },
    },
  ];

  return {
    schemaVersion: 1,
    id: `project-${Date.now()}`,
    name,
    fps: 30,
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    durationFrames: 600, // 20 seconds
    backgroundColor: '#000000',
    tracks: defaultTracks,
    clips: defaultClips,
    assets: defaultAssets,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Save project to localStorage with index tracking
 */
export const saveProjectLocal = (project: TimelineProject): void => {
  try {
    const key = `${STORAGE_PREFIX}${project.id}`;
    const payload = JSON.stringify({
      ...project,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(key, payload);
    localStorage.setItem(RECENT_PROJECT_KEY, project.id);

    // Update index
    const indexRaw = localStorage.getItem(PROJECT_LIST_KEY);
    const index: { id: string; name: string; updatedAt: string }[] = indexRaw
      ? JSON.parse(indexRaw)
      : [];

    const existingIdx = index.findIndex((item) => item.id === project.id);
    const summary = {
      id: project.id,
      name: project.name,
      updatedAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
      index[existingIdx] = summary;
    } else {
      index.unshift(summary);
    }
    localStorage.setItem(PROJECT_LIST_KEY, JSON.stringify(index.slice(0, 20)));
  } catch (err) {
    console.error('Failed to save project locally:', err);
  }
};

/**
 * Load project from localStorage
 */
export const loadProjectLocal = (projectId?: string): TimelineProject | null => {
  try {
    const idToLoad = projectId || localStorage.getItem(RECENT_PROJECT_KEY);
    if (!idToLoad) return null;

    const data = localStorage.getItem(`${STORAGE_PREFIX}${idToLoad}`);
    if (!data) return null;

    const project = JSON.parse(data) as TimelineProject;
    if (project.schemaVersion >= 1 && Array.isArray(project.tracks)) {
      // If legacy project without hero layers, return null so createDefaultProject is used
      const hasHeroClips = project.clips.some(
        (c) => c.id === 'clip-hero-headline' || c.id === 'clip-hero-media'
      );
      if (!hasHeroClips && !projectId) {
        return null;
      }

      if (hasHeroClips && !projectId) {
        // Auto-heal legacy cached default project where media was esports but headline was "Make every frame count."
        const headline = project.clips.find((c) => c.id === 'clip-hero-headline');
        const media = project.clips.find((c) => c.id === 'clip-hero-media');
        if (
          headline?.textConfig?.text === 'Make every frame count.' &&
          media &&
          (media.assetId === 'asset-esports-showreel' || media.name.includes('Esports'))
        ) {
          media.assetId = 'footage-horizon-auto';
          media.name = 'Apex Horizon — Supercar Track Anthem';
        }
      }

      return project;
    }
    return null;
  } catch (err) {
    console.error('Failed to load project locally:', err);
    return null;
  }
};

/**
 * Export project to downloaded JSON file (.pixelproj)
 */
export const exportProjectFile = (project: TimelineProject): void => {
  const jsonStr = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, '_')}.pixelproj`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Parse and validate an imported project file
 */
export const parseAndValidateProject = (jsonString: string): TimelineProject => {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid project file: not a JSON object.');
  }
  if (!parsed.id || !parsed.name || !Array.isArray(parsed.tracks) || !Array.isArray(parsed.clips)) {
    throw new Error('Invalid project file structure: missing essential timeline tracks or clips.');
  }

  return {
    ...parsed,
    schemaVersion: parsed.schemaVersion || 1,
    fps: parsed.fps || 30,
    width: parsed.width || 1920,
    height: parsed.height || 1080,
    aspectRatio: parsed.aspectRatio || '16:9',
    durationFrames: parsed.durationFrames || 600,
    backgroundColor: parsed.backgroundColor || '#000000',
    tracks: parsed.tracks,
    clips: parsed.clips,
    assets: Array.isArray(parsed.assets) ? parsed.assets : [],
    updatedAt: new Date().toISOString(),
  };
};
