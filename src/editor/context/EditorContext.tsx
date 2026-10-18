import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  TimelineProject,
  TimelineClip,
  TimelineTrack,
  MediaAsset,
  EditorTool,
  AspectRatio,
  ASPECT_RATIO_RESOLUTIONS,
  TrackType,
} from '../types';
import {
  createDefaultProject,
  saveProjectLocal,
  loadProjectLocal,
} from '../utils/storage';
import { PlaybackEngine } from '../engine/playbackEngine';
import { findSnapTarget, collectSnapPoints } from '../utils/snapping';

interface EditorContextType {
  project: TimelineProject;
  currentFrame: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  selectedClip: TimelineClip | undefined;
  activeTool: EditorTool;
  zoomLevel: number;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;

  // Playback engine
  engine: PlaybackEngine;

  // Tool & selection
  setActiveTool: (tool: EditorTool) => void;
  setZoomLevel: (zoom: number) => void;
  selectClip: (clipId: string | null) => void;
  seekToFrame: (frame: number) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  stepFrame: (delta: number) => void;
  jumpToStart: () => void;
  jumpToEnd: () => void;

  // History
  undo: () => void;
  redo: () => void;

  // Timeline operations
  addClip: (clip: Omit<TimelineClip, 'id'>) => string;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  deleteClip: (clipId: string) => void;
  duplicateClip: (clipId: string) => void;
  splitClipAtPlayhead: (clipId?: string) => void;
  moveClip: (clipId: string, newStartFrame: number, newTrackId?: string, enableSnapping?: boolean) => void;
  trimClip: (clipId: string, edge: 'start' | 'end', newFrame: number) => void;

  // Track operations
  addTrack: (type: TrackType) => void;
  toggleTrackVisibility: (trackId: string) => void;
  toggleTrackLock: (trackId: string) => void;
  toggleTrackMute: (trackId: string) => void;

  // Asset operations
  importAsset: (asset: MediaAsset) => void;
  removeAsset: (assetId: string) => void;

  // Project meta
  updateProjectMeta: (updates: Partial<TimelineProject>) => void;
  setAspectRatio: (aspect: AspectRatio) => void;
  saveProjectNow: () => void;
  loadProjectData: (proj: TimelineProject) => void;
  resetProject: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize project from storage or default
  const [project, setProject] = useState<TimelineProject>(() => {
    return loadProjectLocal() || createDefaultProject('Pixel Media Creative Sequence');
  });

  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('select');
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // 0.25 to 3.0
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(() => new Date().toLocaleTimeString());
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // Undo / Redo history stacks
  const historyStack = useRef<TimelineProject[]>([]);
  const redoStack = useRef<TimelineProject[]>([]);
  const isUndoRedoAction = useRef<boolean>(false);

  // Playback engine
  const [engine] = useState<PlaybackEngine>(() => new PlaybackEngine(project));

  // Subscribe to playback engine
  useEffect(() => {
    const unsubFrame = engine.subscribeFrame((f) => setCurrentFrame(f));
    const unsubState = engine.subscribeState((p) => setIsPlaying(p));
    return () => {
      unsubFrame();
      unsubState();
    };
  }, [engine]);

  // Keep engine updated with project
  useEffect(() => {
    engine.updateProject(project);
  }, [project, engine]);

  // Debounced auto-save to localStorage
  useEffect(() => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        saveProjectLocal(project);
        setSaveStatus('saved');
        setLastSavedAt(new Date().toLocaleTimeString());
      } catch {
        setSaveStatus('error');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [project]);

  // Commit state to history stack
  const pushHistory = useCallback((currentProj: TimelineProject) => {
    historyStack.current.push(JSON.parse(JSON.stringify(currentProj)));
    if (historyStack.current.length > 40) {
      historyStack.current.shift();
    }
    redoStack.current = []; // Clear redo stack on new action
    setCanUndo(true);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (historyStack.current.length === 0) return;
    const previous = historyStack.current.pop()!;
    redoStack.current.push(JSON.parse(JSON.stringify(project)));
    isUndoRedoAction.current = true;
    setProject(previous);
    setCanUndo(historyStack.current.length > 0);
    setCanRedo(true);
  }, [project]);

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return;
    const next = redoStack.current.pop()!;
    historyStack.current.push(JSON.parse(JSON.stringify(project)));
    isUndoRedoAction.current = true;
    setProject(next);
    setCanUndo(true);
    setCanRedo(redoStack.current.length > 0);
  }, [project]);

  // Transport controls
  const seekToFrame = useCallback((frame: number) => engine.seekToFrame(frame), [engine]);
  const togglePlay = useCallback(() => engine.togglePlay(), [engine]);
  const play = useCallback(() => engine.play(), [engine]);
  const pause = useCallback(() => engine.pause(), [engine]);
  const stepFrame = useCallback((delta: number) => engine.stepFrame(delta), [engine]);
  const jumpToStart = useCallback(() => engine.jumpToStart(), [engine]);
  const jumpToEnd = useCallback(() => engine.jumpToEnd(), [engine]);

  const selectClip = useCallback((clipId: string | null) => {
    setSelectedClipId(clipId);
  }, []);

  const selectedClip = useMemo(() => {
    return project.clips.find((c) => c.id === selectedClipId);
  }, [project.clips, selectedClipId]);

  // Timeline operations
  const addClip = useCallback(
    (clipData: Omit<TimelineClip, 'id'>): string => {
      pushHistory(project);
      const newId = `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newClip: TimelineClip = {
        ...clipData,
        id: newId,
      };

      setProject((prev) => {
        // Expand project duration if clip exceeds current boundary
        const clipEnd = newClip.startFrame + newClip.durationFrames;
        const durationFrames = Math.max(prev.durationFrames, clipEnd + 60);
        return {
          ...prev,
          durationFrames,
          clips: [...prev.clips, newClip],
        };
      });

      setSelectedClipId(newId);
      return newId;
    },
    [project, pushHistory]
  );

  const updateClip = useCallback(
    (clipId: string, updates: Partial<TimelineClip>) => {
      pushHistory(project);
      setProject((prev) => ({
        ...prev,
        clips: prev.clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c)),
      }));
    },
    [project, pushHistory]
  );

  const deleteClip = useCallback(
    (clipId: string) => {
      pushHistory(project);
      setProject((prev) => ({
        ...prev,
        clips: prev.clips.filter((c) => c.id !== clipId),
      }));
      if (selectedClipId === clipId) {
        setSelectedClipId(null);
      }
    },
    [project, pushHistory, selectedClipId]
  );

  const duplicateClip = useCallback(
    (clipId: string) => {
      const target = project.clips.find((c) => c.id === clipId);
      if (!target) return;

      pushHistory(project);
      const newId = `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const cloned: TimelineClip = {
        ...JSON.parse(JSON.stringify(target)),
        id: newId,
        startFrame: target.startFrame + target.durationFrames,
      };

      setProject((prev) => ({
        ...prev,
        clips: [...prev.clips, cloned],
      }));
      setSelectedClipId(newId);
    },
    [project, pushHistory]
  );

  const splitClipAtPlayhead = useCallback(
    (targetClipId?: string) => {
      const clipToSplit = targetClipId
        ? project.clips.find((c) => c.id === targetClipId)
        : project.clips.find(
            (c) =>
              currentFrame > c.startFrame &&
              currentFrame < c.startFrame + c.durationFrames
          );

      if (!clipToSplit) return;

      const splitPoint = currentFrame;
      const firstDuration = splitPoint - clipToSplit.startFrame;
      const secondDuration = clipToSplit.durationFrames - firstDuration;

      if (firstDuration <= 1 || secondDuration <= 1) return;

      pushHistory(project);

      const speed = clipToSplit.speed || 1.0;
      const secondSourceIn = clipToSplit.sourceInFrame + Math.round(firstDuration * speed);

      const firstClip: TimelineClip = {
        ...clipToSplit,
        durationFrames: firstDuration,
        sourceOutFrame: secondSourceIn,
      };

      const secondId = `clip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const secondClip: TimelineClip = {
        ...JSON.parse(JSON.stringify(clipToSplit)),
        id: secondId,
        startFrame: splitPoint,
        durationFrames: secondDuration,
        sourceInFrame: secondSourceIn,
      };

      setProject((prev) => ({
        ...prev,
        clips: prev.clips.map((c) => (c.id === clipToSplit.id ? firstClip : c)).concat(secondClip),
      }));
      setSelectedClipId(secondId);
    },
    [project, currentFrame, pushHistory]
  );

  const moveClip = useCallback(
    (clipId: string, candidateStartFrame: number, newTrackId?: string, enableSnapping = true) => {
      const target = project.clips.find((c) => c.id === clipId);
      if (!target) return;

      let finalStart = Math.max(0, candidateStartFrame);

      if (enableSnapping) {
        const snapPoints = collectSnapPoints(project.clips, currentFrame, clipId);
        const startSnap = findSnapTarget(finalStart, snapPoints);
        if (startSnap.snapped) {
          finalStart = startSnap.snappedFrame;
        } else {
          // Check snap on clip's end edge
          const candidateEnd = finalStart + target.durationFrames;
          const endSnap = findSnapTarget(candidateEnd, snapPoints);
          if (endSnap.snapped) {
            finalStart = Math.max(0, endSnap.snappedFrame - target.durationFrames);
          }
        }
      }

      setProject((prev) => ({
        ...prev,
        clips: prev.clips.map((c) => {
          if (c.id === clipId) {
            return {
              ...c,
              startFrame: finalStart,
              trackId: newTrackId || c.trackId,
            };
          }
          return c;
        }),
      }));
    },
    [project.clips, currentFrame]
  );

  const trimClip = useCallback(
    (clipId: string, edge: 'start' | 'end', newFrame: number) => {
      const target = project.clips.find((c) => c.id === clipId);
      if (!target) return;

      if (edge === 'start') {
        const oldEnd = target.startFrame + target.durationFrames;
        const clampedStart = Math.max(0, Math.min(oldEnd - 5, newFrame));
        const delta = clampedStart - target.startFrame;
        const speed = target.speed || 1.0;

        setProject((prev) => ({
          ...prev,
          clips: prev.clips.map((c) => {
            if (c.id === clipId) {
              return {
                ...c,
                startFrame: clampedStart,
                durationFrames: oldEnd - clampedStart,
                sourceInFrame: Math.max(0, c.sourceInFrame + Math.round(delta * speed)),
              };
            }
            return c;
          }),
        }));
      } else {
        // Trimming end edge
        const clampedEnd = Math.max(target.startFrame + 5, newFrame);
        const newDuration = clampedEnd - target.startFrame;
        const speed = target.speed || 1.0;

        setProject((prev) => ({
          ...prev,
          clips: prev.clips.map((c) => {
            if (c.id === clipId) {
              return {
                ...c,
                durationFrames: newDuration,
                sourceOutFrame: c.sourceInFrame + Math.round(newDuration * speed),
              };
            }
            return c;
          }),
        }));
      }
    },
    [project.clips]
  );

  // Track operations
  const addTrack = useCallback(
    (type: TrackType) => {
      pushHistory(project);
      const newId = `track-${Date.now()}`;
      const prefix = type === 'video' ? 'V' : type === 'audio' ? 'A' : type === 'text' ? 'T' : 'S';
      const count = project.tracks.filter((t) => t.type === type).length + 1;

      const newTrack: TimelineTrack = {
        id: newId,
        name: `${prefix}${count} • ${type.toUpperCase()}`,
        type,
        order: project.tracks.length,
        muted: false,
        locked: false,
        visible: true,
        volume: 1.0,
      };

      setProject((prev) => ({
        ...prev,
        tracks: [...prev.tracks, newTrack],
      }));
    },
    [project, pushHistory]
  );

  const toggleTrackVisibility = useCallback((trackId: string) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, visible: !t.visible } : t)),
    }));
  }, []);

  const toggleTrackLock = useCallback((trackId: string) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t)),
    }));
  }, []);

  const toggleTrackMute = useCallback((trackId: string) => {
    setProject((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
    }));
  }, []);

  // Asset operations
  const importAsset = useCallback(
    (asset: MediaAsset) => {
      pushHistory(project);
      setProject((prev) => ({
        ...prev,
        assets: [asset, ...prev.assets],
      }));
    },
    [project, pushHistory]
  );

  const removeAsset = useCallback(
    (assetId: string) => {
      pushHistory(project);
      setProject((prev) => ({
        ...prev,
        assets: prev.assets.filter((a) => a.id !== assetId),
        clips: prev.clips.filter((c) => c.assetId !== assetId),
      }));
    },
    [project, pushHistory]
  );

  const updateProjectMeta = useCallback(
    (updates: Partial<TimelineProject>) => {
      pushHistory(project);
      setProject((prev) => ({
        ...prev,
        ...updates,
      }));
    },
    [project, pushHistory]
  );

  const setAspectRatio = useCallback(
    (aspect: AspectRatio) => {
      pushHistory(project);
      const res = ASPECT_RATIO_RESOLUTIONS[aspect] || { width: 1920, height: 1080 };
      setProject((prev) => ({
        ...prev,
        aspectRatio: aspect,
        width: res.width,
        height: res.height,
      }));
    },
    [project, pushHistory]
  );

  const saveProjectNow = useCallback(() => {
    setSaveStatus('saving');
    try {
      saveProjectLocal(project);
      setSaveStatus('saved');
      setLastSavedAt(new Date().toLocaleTimeString());
    } catch {
      setSaveStatus('error');
    }
  }, [project]);

  const loadProjectData = useCallback((newProject: TimelineProject) => {
    historyStack.current = [];
    redoStack.current = [];
    setProject(newProject);
    setSelectedClipId(null);
    engine.seekToFrame(0);
  }, [engine]);

  const resetProject = useCallback(() => {
    const fresh = createDefaultProject('New Creative Sequence');
    loadProjectData(fresh);
  }, [loadProjectData]);

  return (
    <EditorContext.Provider
      value={{
        project,
        currentFrame,
        isPlaying,
        selectedClipId,
        selectedClip,
        activeTool,
        zoomLevel,
        saveStatus,
        lastSavedAt,
        canUndo,
        canRedo,
        engine,
        setActiveTool,
        setZoomLevel,
        selectClip,
        seekToFrame,
        togglePlay,
        play,
        pause,
        stepFrame,
        jumpToStart,
        jumpToEnd,
        undo,
        redo,
        addClip,
        updateClip,
        deleteClip,
        duplicateClip,
        splitClipAtPlayhead,
        moveClip,
        trimClip,
        addTrack,
        toggleTrackVisibility,
        toggleTrackLock,
        toggleTrackMute,
        importAsset,
        removeAsset,
        updateProjectMeta,
        setAspectRatio,
        saveProjectNow,
        loadProjectData,
        resetProject,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextType => {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return ctx;
};
