import React, { useState } from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { EditorHeader } from './EditorHeader';
import { MediaPanel } from './MediaPanel';
import { TitlesPanel } from './TitlesPanel';
import { PreviewCanvas } from './PreviewCanvas';
import { InspectorPanel } from './InspectorPanel';
import { Timeline } from './Timeline';

interface DesktopEditorWorkspaceProps {
  onOpenExportModal: () => void;
}

export const DesktopEditorWorkspace: React.FC<DesktopEditorWorkspaceProps> = ({
  onOpenExportModal,
}) => {
  const [leftTab, setLeftTab] = useState<'media' | 'titles'>('media');

  return (
    <div className="nle-desktop-workspace">
      {/* Top Professional Toolbar */}
      <EditorHeader onOpenExportModal={onOpenExportModal} />

      {/* Middle Workspace: Left Panel, Center Canvas, Right Inspector */}
      <div className="nle-middle-workspace">
        {/* Left Side: Media Pool & Motion Titles */}
        <div className="nle-left-column">
          <div className="nle-left-tab-bar">
            <button
              className={`left-tab-btn ${leftTab === 'media' ? 'active' : ''}`}
              onClick={() => setLeftTab('media')}
            >
              <Layers size={13} />
              <span>Media Library</span>
            </button>
            <button
              className={`left-tab-btn ${leftTab === 'titles' ? 'active' : ''}`}
              onClick={() => setLeftTab('titles')}
            >
              <Sparkles size={13} />
              <span>Motion Titles</span>
            </button>
          </div>

          <div className="nle-left-content">
            {leftTab === 'media' ? <MediaPanel /> : <TitlesPanel />}
          </div>
        </div>

        {/* Center: Composition Preview Monitor */}
        <div className="nle-center-column">
          <PreviewCanvas />
        </div>

        {/* Right: Clip & Property Inspector */}
        <div className="nle-right-column">
          <InspectorPanel />
        </div>
      </div>

      {/* Bottom: Multitrack Timeline */}
      <div className="nle-bottom-timeline-area">
        <Timeline />
      </div>
    </div>
  );
};
