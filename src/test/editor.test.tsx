import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { EditorRoot } from '../editor/components/EditorRoot';
import {
  framesToTimecode,
  timecodeToFrames,
  framesToSeconds,
  secondsToFrames,
} from '../editor/utils/timecode';
import { interpolateProperty, calculateEasing } from '../editor/utils/interpolation';
import { findSnapTarget, collectSnapPoints } from '../editor/utils/snapping';
import { detectMediaType } from '../editor/utils/mediaUtils';
import {
  createDefaultProject,
  parseAndValidateProject,
  saveProjectLocal,
  loadProjectLocal,
} from '../editor/utils/storage';
import { detectSupportedExportFormats } from '../editor/engine/exportEngine';

describe('Video & Motion Graphics Editor Core Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // 1. Timecode & Frame Conversions
  describe('Timecode & Frame Math', () => {
    it('converts frames to SMPTE timecode (HH:MM:SS:FF)', () => {
      expect(framesToTimecode(0, 30)).toBe('00:00:00:00');
      expect(framesToTimecode(15, 30)).toBe('00:00:00:15');
      expect(framesToTimecode(30, 30)).toBe('00:00:01:00');
      expect(framesToTimecode(1800, 30)).toBe('00:01:00:00');
      expect(framesToTimecode(108000, 30)).toBe('01:00:00:00');
    });

    it('converts SMPTE timecode back to integer frames', () => {
      expect(timecodeToFrames('00:00:01:00', 30)).toBe(30);
      expect(timecodeToFrames('00:01:00:00', 30)).toBe(1800);
      expect(timecodeToFrames('00:00:00:15', 30)).toBe(15);
    });

    it('converts seconds to frames and vice versa', () => {
      expect(secondsToFrames(2.5, 30)).toBe(75);
      expect(framesToSeconds(90, 30)).toBe(3);
    });
  });

  // 2. Keyframe Interpolation & Easing
  describe('Keyframe Interpolation Engine', () => {
    it('calculates linear and easing curves correctly', () => {
      expect(calculateEasing(0, 'linear')).toBe(0);
      expect(calculateEasing(1, 'linear')).toBe(1);
      expect(calculateEasing(0.5, 'linear')).toBe(0.5);

      expect(calculateEasing(0.5, 'ease-in')).toBe(0.25);
      expect(calculateEasing(0.5, 'ease-out')).toBe(0.75);
    });

    it('interpolates numeric values across keyframe sequences', () => {
      const keyframes = [
        { id: 'k1', frame: 0, value: 100, easing: 'linear' as const },
        { id: 'k2', frame: 50, value: 200, easing: 'linear' as const },
        { id: 'k3', frame: 100, value: 400, easing: 'linear' as const },
      ];

      // Exact boundaries
      expect(interpolateProperty(keyframes, 0, 0)).toBe(100);
      expect(interpolateProperty(keyframes, 50, 0)).toBe(200);
      expect(interpolateProperty(keyframes, 100, 0)).toBe(400);

      // Midpoints
      expect(interpolateProperty(keyframes, 25, 0)).toBe(150);
      expect(interpolateProperty(keyframes, 75, 0)).toBe(300);

      // Out of bounds clamps
      expect(interpolateProperty(keyframes, -10, 0)).toBe(100);
      expect(interpolateProperty(keyframes, 150, 0)).toBe(400);

      // Default fallback when empty
      expect(interpolateProperty([], 10, 50)).toBe(50);
    });
  });

  // 3. Snapping Engine
  describe('Magnetic Snapping Calculations', () => {
    it('collects all snap target boundaries on timeline', () => {
      const mockClips = [
        {
          id: 'c1',
          trackId: 't1',
          name: 'Clip 1',
          type: 'video' as const,
          startFrame: 0,
          durationFrames: 60,
          sourceInFrame: 0,
          sourceOutFrame: 60,
          speed: 1,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
        },
        {
          id: 'c2',
          trackId: 't1',
          name: 'Clip 2',
          type: 'video' as const,
          startFrame: 100,
          durationFrames: 50,
          sourceInFrame: 0,
          sourceOutFrame: 50,
          speed: 1,
          transform: { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
        },
      ];

      const snapPoints = collectSnapPoints(mockClips, 45);
      expect(snapPoints).toContain(0);
      expect(snapPoints).toContain(45); // playhead
      expect(snapPoints).toContain(60); // c1 end
      expect(snapPoints).toContain(100); // c2 start
      expect(snapPoints).toContain(150); // c2 end
    });

    it('snaps candidate frame when within threshold', () => {
      const snapPoints = [0, 60, 100, 150];

      // Within threshold (distance <= 5)
      const res1 = findSnapTarget(62, snapPoints, 5);
      expect(res1.snapped).toBe(true);
      expect(res1.snappedFrame).toBe(60);

      // Outside threshold
      const res2 = findSnapTarget(75, snapPoints, 5);
      expect(res2.snapped).toBe(false);
      expect(res2.snappedFrame).toBe(75);
    });
  });

  // 4. Media Asset Detection
  describe('Media Asset Format Detection', () => {
    it('accurately identifies video, audio, and images by mime type and extension', () => {
      const videoFile = new File([''], 'action_reel.mp4', { type: 'video/mp4' });
      expect(detectMediaType(videoFile)).toBe('video');

      const audioFile = new File([''], 'soundtrack.mp3', { type: 'audio/mpeg' });
      expect(detectMediaType(audioFile)).toBe('audio');

      const imageFile = new File([''], 'still_title.png', { type: 'image/png' });
      expect(detectMediaType(imageFile)).toBe('image');
    });
  });

  // 5. Project Schema & Storage
  describe('Project Persistence & Validation', () => {
    it('creates default project schema with tracks and sample clips', () => {
      const proj = createDefaultProject('Test Sequence');
      expect(proj.schemaVersion).toBe(1);
      expect(proj.name).toBe('Test Sequence');
      expect(proj.tracks.length).toBeGreaterThanOrEqual(3);
      expect(proj.clips.length).toBeGreaterThanOrEqual(1);
    });

    it('serializes to localStorage and recovers cleanly', () => {
      const proj = createDefaultProject('Storage Test');
      saveProjectLocal(proj);

      const recovered = loadProjectLocal(proj.id);
      expect(recovered).not.toBeNull();
      expect(recovered?.name).toBe('Storage Test');
      expect(recovered?.clips.length).toBe(proj.clips.length);
    });

    it('validates imported JSON project data and rejects malformed objects', () => {
      const validJson = JSON.stringify(createDefaultProject('Valid Import'));
      const parsed = parseAndValidateProject(validJson);
      expect(parsed.name).toBe('Valid Import');

      expect(() => parseAndValidateProject('{"invalid": true}')).toThrow();
    });
  });

  // 6. Export Capability Detection
  describe('Export Engine Capability Detection', () => {
    it('detects available browser containers without errors', () => {
      const formats = detectSupportedExportFormats();
      expect(formats).toHaveProperty('mp4');
      expect(formats).toHaveProperty('webm');
      expect(formats).toHaveProperty('mimeType');
      expect(formats).toHaveProperty('extension');
    });
  });

  // 7. Full Editor Workspace UI Integration
  describe('Editor Workspace UI & Interactions', () => {
    it('renders the complete nonlinear editing studio with toolbar, canvas, timeline, and inspector', () => {
      render(
        <MemoryRouter>
          <EditorRoot />
        </MemoryRouter>
      );

      // Top Toolbar controls
      expect(screen.getByText(/PIXEL EDIT/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Undo$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Redo$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export video/i })).toBeInTheDocument();

      // Left panel tabs
      expect(screen.getByRole('button', { name: /media library/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /motion titles/i })).toBeInTheDocument();

      // Center Canvas & Transport Bar
      expect(screen.getByRole('button', { name: /jump to sequence start/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^play$/i })).toBeInTheDocument();

      // Bottom Timeline
      expect(screen.getByRole('region', { name: /timeline editor/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /split at playhead/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add track/i })).toBeInTheDocument();

      // Sequence Settings in Inspector
      expect(screen.getByText(/Sequence Settings/i)).toBeInTheDocument();
    });

    it('selects a timeline clip and displays its transform & typography controls in Inspector', () => {
      render(
        <MemoryRouter>
          <EditorRoot />
        </MemoryRouter>
      );

      // Find the text title clip on timeline
      const titleClip = screen.getByText('Make every frame count.');
      expect(titleClip).toBeInTheDocument();

      // Click to select
      fireEvent.click(titleClip);

      // Inspector switches to clip properties
      expect(screen.getByText(/2D Transform/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^text$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^motion$/i })).toBeInTheDocument();
    });

    it('opens export modal and displays format and quality options', async () => {
      render(
        <MemoryRouter>
          <EditorRoot />
        </MemoryRouter>
      );

      const exportBtn = screen.getByRole('button', { name: /export video/i });
      fireEvent.click(exportBtn);

      await waitFor(() => {
        expect(screen.getByText('Export Master Video')).toBeInTheDocument();
        expect(screen.getByText(/WebM \(VP9\/VP8\)/i)).toBeInTheDocument();
        expect(screen.getByText(/1080p Full HD/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /start render/i })).toBeInTheDocument();
      });
    });
  });
});
