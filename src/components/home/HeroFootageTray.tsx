import React, { useState } from 'react';
import {
  Film,
  Plus,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { useEditor } from '../../editor/context/EditorContext';
import { MediaAsset } from '../../editor/types';

export interface StudioFootageItem {
  id: string;
  name: string;
  category: 'Commercial' | 'Esports' | 'Beauty' | 'Cyberpunk' | '3D Motion' | 'Aerial' | 'Action';
  durationLabel: string;
  durationFrames: number;
  resolution: string;
  fps: number;
  thumbnailUrl: string;
  mediaUrl: string;
  suggestedHeadline?: string;
  suggestedSubtitle?: string;
}

export const STUDIO_FOOTAGES: StudioFootageItem[] = [
  {
    id: 'footage-esports-final',
    name: 'VCT Championship — Grand Finals Reel',
    category: 'Esports',
    durationLabel: '20s',
    durationFrames: 600,
    resolution: '4K UHD',
    fps: 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85',
    suggestedHeadline: 'Kinetic energy at 240 FPS.',
    suggestedSubtitle: 'High-impact tournament gameplay recap, audio sync, and 3D motion tracking.',
  },
  {
    id: 'footage-horizon-auto',
    name: 'Apex Horizon — Supercar Track Anthem',
    category: 'Commercial',
    durationLabel: '20s',
    durationFrames: 600,
    resolution: '4K ACES',
    fps: 30,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1920&q=85',
    suggestedHeadline: 'Make every frame count.',
    suggestedSubtitle: 'Thoughtful editing, striking visuals, and motion that brings your ideas to life.',
  },
  {
    id: 'footage-luminary-fashion',
    name: 'Vogue Luminary — Autumn Cover Master',
    category: 'Beauty',
    durationLabel: '18s',
    durationFrames: 540,
    resolution: '4K 16-Bit',
    fps: 30,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85',
    suggestedHeadline: 'Elegance in every pixel.',
    suggestedSubtitle: 'High-end frequency separation, texture preservation, and harmonic color grading.',
  },
  {
    id: 'footage-tokyo-neon',
    name: 'Tokyo Night Streets — Cyber Neon RAW',
    category: 'Cyberpunk',
    durationLabel: '20s',
    durationFrames: 600,
    resolution: '4K ProRes',
    fps: 30,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85',
    suggestedHeadline: 'Electric pulse of the city.',
    suggestedSubtitle: 'Rain-slicked asphalt, anamorphic lens flares, and deep neon contrast.',
  },
  {
    id: 'footage-synthetix-3d',
    name: 'Synthetix 3D — Holographic Particles',
    category: '3D Motion',
    durationLabel: '20s',
    durationFrames: 600,
    resolution: '4K 60FPS',
    fps: 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=85',
    suggestedHeadline: 'Procedural worlds in motion.',
    suggestedSubtitle: 'Volumetric particle lighting, 3D simulations, and kinetic typography.',
  },
  {
    id: 'footage-nordic-aerial',
    name: 'Nordic Horizons — Cinematic Drone Aerial',
    category: 'Aerial',
    durationLabel: '24s',
    durationFrames: 720,
    resolution: '4K D-Log',
    fps: 30,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=85',
    suggestedHeadline: 'Limitless perspectives.',
    suggestedSubtitle: 'Sweeping coastal cliffs, glacial valleys, and smooth cinematic gimbal pans.',
  },
  {
    id: 'footage-kinetic-skate',
    name: 'Kinetic Velocity — Street Action Reel',
    category: 'Action',
    durationLabel: '15s',
    durationFrames: 450,
    resolution: '4K 120FPS',
    fps: 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=1920&q=85',
    suggestedHeadline: 'Precision timing and impact.',
    suggestedSubtitle: 'Ultra slow-motion action captures synced to heavy sound design kicks.',
  },
  {
    id: 'footage-cyber-grid',
    name: 'Cyber Grid — High Speed Motion Title',
    category: 'Cyberpunk',
    durationLabel: '16s',
    durationFrames: 480,
    resolution: '4K Alpha',
    fps: 30,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    mediaUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=85',
    suggestedHeadline: 'Next-gen visual architecture.',
    suggestedSubtitle: 'Futuristic HUD elements, wireframe grid sweeps, and glitch transitions.',
  },
];

export const HeroFootageTray: React.FC = () => {
  const {
    project,
    updateClip,
    addClip,
    importAsset,
    currentFrame,
    selectClip,
    engine,
    seekToFrame,
  } = useEditor();

  const [isOpen, setIsOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAppliedId, setActiveAppliedId] = useState<string | null>(null);

  const categories = ['All', 'Commercial', 'Esports', 'Beauty', 'Cyberpunk', '3D Motion', 'Aerial', 'Action'];

  const filteredFootages = STUDIO_FOOTAGES.filter((item) => {
    const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Ensure footage is registered as a MediaAsset in project
  const getOrCreateAsset = (item: StudioFootageItem): MediaAsset => {
    let asset = project.assets.find((a) => a.id === item.id);
    if (!asset) {
      asset = {
        id: item.id,
        name: item.name,
        type: 'image',
        url: item.mediaUrl,
        durationFrames: item.durationFrames,
        width: 1920,
        height: 1080,
        fps: item.fps,
        thumbnailUrl: item.thumbnailUrl,
        createdAt: new Date().toISOString(),
      };
      importAsset(asset);
    }
    return asset;
  };

  // Replace active media layer in hero
  const handleApplyToActiveLayer = (item: StudioFootageItem) => {
    const asset = getOrCreateAsset(item);

    // Preload & register image element into engine immediately
    if (typeof window !== 'undefined') {
      const img = new Image();
      if (item.mediaUrl.startsWith('http://') || item.mediaUrl.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = item.mediaUrl;
      img.onload = () => {
        engine.notifyMediaLoaded();
      };
      engine.registerMediaElement(asset.id, img);
    }

    const mediaClip = project.clips.find((c) => c.id === 'clip-hero-media') ||
      project.clips.find((c) => c.type === 'image' || c.type === 'video');

    if (mediaClip) {
      updateClip(mediaClip.id, {
        assetId: asset.id,
        name: item.name,
      });
      selectClip(mediaClip.id);
    }

    // Optionally update headline and subtitle if suggested
    if (item.suggestedHeadline) {
      const headlineClip = project.clips.find((c) => c.id === 'clip-hero-headline');
      if (headlineClip && headlineClip.textConfig) {
        updateClip(headlineClip.id, {
          textConfig: {
            ...headlineClip.textConfig,
            text: item.suggestedHeadline,
          },
        });
      }
    }

    if (item.suggestedSubtitle) {
      const subtitleClip = project.clips.find((c) => c.id === 'clip-hero-subtitle');
      if (subtitleClip && subtitleClip.textConfig) {
        updateClip(subtitleClip.id, {
          textConfig: {
            ...subtitleClip.textConfig,
            text: item.suggestedSubtitle,
          },
        });
      }
    }

    setActiveAppliedId(item.id);
    setTimeout(() => setActiveAppliedId(null), 1800);
  };

  // Add footage as an extra clip on track V1
  const handleAddToTimeline = (item: StudioFootageItem) => {
    const asset = getOrCreateAsset(item);

    // Preload & register image element into engine immediately
    if (typeof window !== 'undefined') {
      const img = new Image();
      if (item.mediaUrl.startsWith('http://') || item.mediaUrl.startsWith('https://')) {
        img.crossOrigin = 'anonymous';
      }
      img.src = item.mediaUrl;
      img.onload = () => {
        engine.notifyMediaLoaded();
      };
      engine.registerMediaElement(asset.id, img);
    }

    // Also update clip-hero-media so the background preview immediately displays the new footage
    const heroMediaClip = project.clips.find((c) => c.id === 'clip-hero-media');
    if (heroMediaClip) {
      updateClip(heroMediaClip.id, {
        assetId: asset.id,
        name: item.name,
      });
    }

    const targetTrack = project.tracks.find((t) => t.type === 'video') || project.tracks[0];
    const newClipId = addClip({
      trackId: targetTrack.id,
      assetId: asset.id,
      name: item.name,
      type: 'image',
      startFrame: currentFrame,
      durationFrames: Math.min(item.durationFrames, 300),
      sourceInFrame: 0,
      sourceOutFrame: Math.min(item.durationFrames, 300),
      speed: 1.0,
      transform: {
        x: 0,
        y: 0,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
      },
    });
    selectClip(newClipId);
    seekToFrame(currentFrame);

    setActiveAppliedId(item.id);
    setTimeout(() => setActiveAppliedId(null), 1800);
  };

  return (
    <div className="hero-footage-tray" role="region" aria-label="Studio Footage Library">
      {/* Tray Header Bar */}
      <div className="footage-tray-header">
        <div className="tray-title-group">
          <Film size={15} className="text-amber" />
          <span className="tray-title-text">Studio Footages & B-Roll</span>
          <span className="tray-count-badge">{STUDIO_FOOTAGES.length} Clips</span>
        </div>

        <div className="tray-controls-group">
          {/* Quick Search */}
          <div className="tray-search-box">
            <Search size={12} className="tray-search-icon" />
            <input
              type="text"
              placeholder="Search footage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="tray-search-input"
            />
          </div>

          {/* Toggle Expand / Collapse */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="tray-toggle-btn"
            title={isOpen ? 'Collapse Footages' : 'Expand Footages'}
          >
            <span>{isOpen ? 'Hide Footages' : 'Show Footages'}</span>
            {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="footage-tray-body">
          {/* Category Filter Pills */}
          <div className="footage-category-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`footage-cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Horizontal Footage Cards Carousel */}
          <div className="footage-cards-carousel">
            {filteredFootages.map((item) => {
              const isApplied = activeAppliedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`footage-card ${isApplied ? 'is-applied' : ''}`}
                  onClick={() => handleApplyToActiveLayer(item)}
                  title={`Click to set as active hero footage: ${item.name}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyToActiveLayer(item);
                  }}
                >
                  <div className="card-thumb-wrapper">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.name}
                      className="card-thumb-img"
                      loading="lazy"
                    />

                    {/* Metadata Overlay Badges */}
                    <div className="card-top-badges">
                      <span className="card-cat-badge">{item.category}</span>
                      <span className="card-res-badge">{item.resolution}</span>
                    </div>

                    <span className="card-dur-badge">{item.durationLabel}</span>

                    {/* Hover Overlay Actions */}
                    <div className="card-hover-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyToActiveLayer(item);
                        }}
                        className="card-action-btn primary"
                        title="Set as hero background footage"
                      >
                        {isApplied ? <Check size={12} /> : <Film size={12} />}
                        <span>{isApplied ? 'Applied' : 'Use Layer'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToTimeline(item);
                        }}
                        className="card-action-btn secondary"
                        title="Add as clip on timeline at current frame"
                      >
                        <Plus size={12} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  <div className="card-info">
                    <span className="card-title" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
