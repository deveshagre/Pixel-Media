import React, { useState, useEffect } from 'react';
import { EditorProvider, useEditor } from '../context/EditorContext';
import { DesktopEditorWorkspace } from './DesktopEditorWorkspace';
import { MobileEditorWorkspace } from './MobileEditorWorkspace';
import { ExportModal } from './ExportModal';

const EditorLayoutInner: React.FC = () => {
  const {
    togglePlay,
    undo,
    redo,
    saveProjectNow,
    deleteClip,
    selectedClipId,
    splitClipAtPlayhead,
    stepFrame,
    jumpToStart,
    jumpToEnd,
  } = useEditor();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Responsive breakpoint listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts when user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Space: Toggle Play/Pause
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
        return;
      }

      // Undo: Cmd+Z or Ctrl+Z
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Cmd+Shift+Z or Ctrl+Shift+Z or Ctrl+Y
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === 'KeyZ') ||
        (e.ctrlKey && e.code === 'KeyY')
      ) {
        e.preventDefault();
        redo();
        return;
      }

      // Save: Cmd+S or Ctrl+S
      if ((e.metaKey || e.ctrlKey) && e.code === 'KeyS') {
        e.preventDefault();
        saveProjectNow();
        return;
      }

      // Split at playhead: S
      if (!e.metaKey && !e.ctrlKey && e.code === 'KeyS') {
        e.preventDefault();
        splitClipAtPlayhead();
        return;
      }

      // Delete clip: Delete or Backspace
      if ((e.code === 'Delete' || e.code === 'Backspace') && selectedClipId) {
        e.preventDefault();
        deleteClip(selectedClipId);
        return;
      }

      // Frame step
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepFrame(e.shiftKey ? -10 : -1);
        return;
      }

      if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepFrame(e.shiftKey ? 10 : 1);
        return;
      }

      // Jump to start / end
      if (e.code === 'Home') {
        e.preventDefault();
        jumpToStart();
        return;
      }

      if (e.code === 'End') {
        e.preventDefault();
        jumpToEnd();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    togglePlay,
    undo,
    redo,
    saveProjectNow,
    deleteClip,
    selectedClipId,
    splitClipAtPlayhead,
    stepFrame,
    jumpToStart,
    jumpToEnd,
  ]);

  return (
    <div className="nle-editor-root">
      {isMobile ? (
        <MobileEditorWorkspace onOpenExportModal={() => setIsExportModalOpen(true)} />
      ) : (
        <DesktopEditorWorkspace onOpenExportModal={() => setIsExportModalOpen(true)} />
      )}

      {/* Video Export Master Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
};

export const EditorRoot: React.FC = () => {
  return (
    <EditorProvider>
      <EditorLayoutInner />
    </EditorProvider>
  );
};

export default EditorRoot;
