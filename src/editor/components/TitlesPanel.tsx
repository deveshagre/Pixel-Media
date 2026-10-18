import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { TextConfig, Keyframe } from '../types';

interface TitlePreset {
  id: string;
  name: string;
  description: string;
  textConfig: TextConfig;
  defaultKeyframes?: {
    scale?: Keyframe[];
    opacity?: Keyframe[];
    y?: Keyframe[];
  };
}

const TITLE_PRESETS: TitlePreset[] = [
  {
    id: 'preset-kinetic',
    name: 'Kinetic Bold Intro',
    description: 'Impactful scale-up typography with drop shadow',
    textConfig: {
      text: 'CINEMATIC IMPACT',
      fontFamily: 'Inter, sans-serif',
      fontSize: 58,
      fontWeight: '900',
      color: '#ffffff',
      align: 'center',
      shadowColor: 'rgba(0,0,0,0.85)',
      shadowBlur: 20,
      presetStyle: 'kinetic',
    },
    defaultKeyframes: {
      scale: [
        { id: 'kf-s1', frame: 0, value: 0.8, easing: 'ease-out' },
        { id: 'kf-s2', frame: 25, value: 1.05, easing: 'ease-in-out' },
        { id: 'kf-s3', frame: 90, value: 1.1, easing: 'linear' },
      ],
      opacity: [
        { id: 'kf-o1', frame: 0, value: 0, easing: 'ease-out' },
        { id: 'kf-o2', frame: 20, value: 1, easing: 'linear' },
        { id: 'kf-o3', frame: 80, value: 1, easing: 'ease-in' },
        { id: 'kf-o4', frame: 90, value: 0, easing: 'linear' },
      ],
    },
  },
  {
    id: 'preset-lower-third',
    name: 'Broadcast Lower Third',
    description: 'Two-tier title for speaker or location ID',
    textConfig: {
      text: 'ALEX VANCE\nCREATIVE DIRECTOR',
      fontFamily: 'Inter, sans-serif',
      fontSize: 34,
      fontWeight: '700',
      color: '#ffffff',
      backgroundColor: 'rgba(9, 9, 11, 0.85)',
      align: 'center',
      lineHeight: 1.35,
      presetStyle: 'lower_third',
    },
    defaultKeyframes: {
      y: [
        { id: 'kf-y1', frame: 0, value: 360, easing: 'ease-out' },
        { id: 'kf-y2', frame: 25, value: 300, easing: 'ease-out' },
      ],
      opacity: [
        { id: 'kf-o1', frame: 0, value: 0, easing: 'ease-out' },
        { id: 'kf-o2', frame: 15, value: 1, easing: 'linear' },
      ],
    },
  },
  {
    id: 'preset-minimal-headline',
    name: 'Editorial Headline',
    description: 'Understated serif aesthetic with subtle tracking',
    textConfig: {
      text: 'Stories Written in Motion.',
      fontFamily: 'serif',
      fontSize: 44,
      fontWeight: '600',
      color: '#f4f4f5',
      align: 'center',
      presetStyle: 'headline',
    },
    defaultKeyframes: {
      opacity: [
        { id: 'kf-o1', frame: 0, value: 0, easing: 'ease-out' },
        { id: 'kf-o2', frame: 30, value: 1, easing: 'linear' },
        { id: 'kf-o3', frame: 90, value: 1, easing: 'ease-in' },
        { id: 'kf-o4', frame: 110, value: 0, easing: 'linear' },
      ],
    },
  },
  {
    id: 'preset-accent-caption',
    name: 'Amber Accent Caption',
    description: 'High-contrast highlighted caption block',
    textConfig: {
      text: 'MAKE EVERY FRAME COUNT',
      fontFamily: 'Inter, sans-serif',
      fontSize: 32,
      fontWeight: '800',
      color: '#09090b',
      backgroundColor: '#e4b363',
      align: 'center',
      presetStyle: 'caption',
    },
  },
];

export const TitlesPanel: React.FC = () => {
  const { project, addClip, currentFrame } = useEditor();

  const handleAddTitle = (preset: TitlePreset) => {
    // Find or target text track
    let textTrack = project.tracks.find((t) => t.type === 'text');
    if (!textTrack) {
      textTrack = project.tracks[0];
    }

    const durationFrames = 120; // 4 seconds at 30 fps
    const startFrame = currentFrame;

    // Shift keyframe frame offsets to match startFrame
    const keyframes = preset.defaultKeyframes
      ? {
          scale: preset.defaultKeyframes.scale?.map((k) => ({ ...k, frame: startFrame + k.frame })),
          opacity: preset.defaultKeyframes.opacity?.map((k) => ({ ...k, frame: startFrame + k.frame })),
          y: preset.defaultKeyframes.y?.map((k) => ({ ...k, frame: startFrame + k.frame })),
        }
      : undefined;

    addClip({
      trackId: textTrack.id,
      name: preset.name,
      type: 'text',
      startFrame,
      durationFrames,
      sourceInFrame: 0,
      sourceOutFrame: durationFrames,
      speed: 1.0,
      transform: {
        x: 0,
        y: preset.id === 'preset-lower-third' ? 300 : 0,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
      },
      textConfig: { ...preset.textConfig },
      keyframes,
    });
  };

  return (
    <div className="nle-titles-panel">
      <div className="nle-panel-title">
        <Sparkles size={16} className="text-amber" />
        <span>Animated Titles & Presets</span>
      </div>
      <p className="nle-panel-desc">
        Select a motion graphics title to drop onto your timeline at the playhead.
      </p>

      <div className="nle-presets-grid">
        {TITLE_PRESETS.map((preset) => (
          <div key={preset.id} className="nle-preset-card">
            <div className="preset-card-header">
              <span className="preset-name">{preset.name}</span>
              <button
                onClick={() => handleAddTitle(preset)}
                className="preset-add-btn"
                title="Add title to timeline"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
            <p className="preset-desc">{preset.description}</p>
            <div className="preset-preview-box">
              <span
                style={{
                  fontFamily: preset.textConfig.fontFamily,
                  fontSize: Math.min(preset.textConfig.fontSize * 0.45, 18),
                  fontWeight: preset.textConfig.fontWeight,
                  color: preset.textConfig.color,
                  backgroundColor: preset.textConfig.backgroundColor,
                  padding: preset.textConfig.backgroundColor ? '3px 8px' : '0',
                  borderRadius: 3,
                }}
              >
                {preset.textConfig.text.split('\n')[0]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
