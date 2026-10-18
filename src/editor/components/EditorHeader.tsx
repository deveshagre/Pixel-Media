import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  RotateCw,
  Save,
  Download,
  Film,
  Upload,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { AspectRatio } from '../types';
import { exportProjectFile, parseAndValidateProject } from '../utils/storage';

interface EditorHeaderProps {
  onOpenExportModal: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ onOpenExportModal }) => {
  const navigate = useNavigate();
  const {
    project,
    canUndo,
    canRedo,
    undo,
    redo,
    saveStatus,
    lastSavedAt,
    saveProjectNow,
    updateProjectMeta,
    setAspectRatio,
    loadProjectData,
  } = useEditor();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== project.name) {
      updateProjectMeta({ name: titleInput.trim() });
    } else {
      setTitleInput(project.name);
    }
  };

  const handleImportProjectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const validated = parseAndValidateProject(content);
        loadProjectData(validated);
      } catch (err: any) {
        alert(`Failed to load project file: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="nle-top-bar" role="banner">
      {/* Left: Branding & Editable Title */}
      <div className="nle-bar-left">
        <button
          onClick={() => navigate('/')}
          className="nle-brand-btn"
          title="Return to Studio Homepage"
        >
          <Film size={18} className="text-amber" />
          <span className="nle-brand-text">PIXEL EDIT</span>
        </button>

        <div className="nle-divider" />

        {isEditingTitle ? (
          <input
            type="text"
            className="nle-title-input"
            value={titleInput}
            autoFocus
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setIsEditingTitle(false);
                setTitleInput(project.name);
              }
            }}
          />
        ) : (
          <button
            onClick={() => {
              setTitleInput(project.name);
              setIsEditingTitle(true);
            }}
            className="nle-title-btn"
            title="Click to rename project sequence"
          >
            <span>{project.name}</span>
          </button>
        )}
      </div>

      {/* Center: Undo/Redo & Sequence Controls */}
      <div className="nle-bar-center">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="nle-icon-btn"
          title="Undo (Ctrl/Cmd + Z)"
          aria-label="Undo"
        >
          <RotateCcw size={15} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className="nle-icon-btn"
          title="Redo (Ctrl/Cmd + Shift + Z)"
          aria-label="Redo"
        >
          <RotateCw size={15} />
        </button>

        <div className="nle-divider" />

        {/* Aspect Ratio Selector */}
        <div className="nle-aspect-selector">
          <label htmlFor="aspect-select" className="sr-only">Aspect Ratio</label>
          <select
            id="aspect-select"
            value={project.aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
            className="nle-select"
            title="Sequence Canvas Aspect Ratio"
          >
            <option value="16:9">16:9 • Standard Landscape (1920x1080)</option>
            <option value="9:16">9:16 • Vertical Shorts/Reels (1080x1920)</option>
            <option value="1:1">1:1 • Square Post (1080x1080)</option>
            <option value="4:5">4:5 • Portrait Social (1080x1350)</option>
            <option value="21:9">21:9 • Cinematic Ultrawide (2560x1080)</option>
          </select>
        </div>

        <div className="nle-divider" />

        {/* Save Status */}
        <div className="nle-save-status" onClick={saveProjectNow} title="Click to force save now">
          {saveStatus === 'saving' && (
            <span className="save-indicator saving">Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="save-indicator saved" title={`Auto-saved at ${lastSavedAt}`}>
              <Check size={13} />
              <span>Saved</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="save-indicator error">
              <AlertCircle size={13} />
              <span>Save error</span>
            </span>
          )}
        </div>
      </div>

      {/* Right: Project file I/O & Export */}
      <div className="nle-bar-right">
        {/* Hidden project file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportProjectFile}
          accept=".pixelproj,.json"
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="nle-tool-btn"
          title="Open .pixelproj project file"
        >
          <Upload size={14} />
          <span>Open</span>
        </button>

        <button
          onClick={() => exportProjectFile(project)}
          className="nle-tool-btn"
          title="Save project backup to .pixelproj file"
        >
          <Save size={14} />
          <span>Save File</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="nle-export-btn"
          title="Render and download master video"
        >
          <Download size={14} />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};
