import React, { useState, useRef } from 'react';
import {
  Upload,
  Film,
  Music,
  Image as ImageIcon,
  Plus,
  Trash2,
  Search,
  Clock,
  Layers,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { MediaAsset, MediaType } from '../types';
import { processImportedFile } from '../utils/mediaUtils';
import { formatTimeDisplay } from '../utils/timecode';

export const MediaPanel: React.FC = () => {
  const { project, importAsset, removeAsset, addClip, currentFrame, engine } = useEditor();
  const [filterType, setFilterType] = useState<MediaType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setImporting(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const asset = await processImportedFile(file, project.fps || 30);
        importAsset(asset);
      } catch (err: any) {
        alert(`Could not import "${file.name}": ${err.message}`);
      }
    }
    setImporting(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const filteredAssets = project.assets.filter((a) => {
    const matchesType = filterType === 'all' || a.type === filterType;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleAddAssetToTimeline = (asset: MediaAsset) => {
    // Preload & register immediately into engine
    if (typeof window !== 'undefined') {
      if (asset.type === 'image') {
        const img = new Image();
        if (asset.url.startsWith('http://') || asset.url.startsWith('https://')) {
          img.crossOrigin = 'anonymous';
        }
        img.src = asset.url;
        img.onload = () => engine.notifyMediaLoaded();
        engine.registerMediaElement(asset.id, img);
      } else if (asset.type === 'video') {
        const video = document.createElement('video');
        if (asset.url.startsWith('http://') || asset.url.startsWith('https://')) {
          video.crossOrigin = 'anonymous';
        }
        video.muted = true;
        video.playsInline = true;
        video.src = asset.url;
        video.onloadeddata = () => engine.notifyMediaLoaded();
        engine.registerMediaElement(asset.id, video);
      }
    }

    // Find suitable track
    let track = project.tracks.find((t) => t.type === asset.type);
    if (!track) {
      track = project.tracks[0];
    }

    const duration = Math.min(asset.durationFrames, 300); // Max 10s initial clip
    addClip({
      trackId: track.id,
      assetId: asset.id,
      name: asset.name,
      type: asset.type === 'image' ? 'image' : asset.type === 'video' ? 'video' : 'audio',
      startFrame: currentFrame,
      durationFrames: duration,
      sourceInFrame: 0,
      sourceOutFrame: duration,
      speed: 1.0,
      transform: {
        x: 0,
        y: 0,
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
      },
    });
  };

  return (
    <div className="nle-media-panel">
      {/* Search and Upload trigger */}
      <div className="nle-panel-header">
        <div className="nle-search-box">
          <Search size={14} className="nle-search-icon" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="nle-search-input"
          />
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="nle-import-btn"
          title="Import media files (video, audio, images)"
        >
          <Upload size={14} />
          <span>Import</span>
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFiles(e.target.files)}
          multiple
          accept="video/*,audio/*,image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* Filter Tabs */}
      <div className="nle-filter-tabs">
        <button
          className={`nle-tab-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          All ({project.assets.length})
        </button>
        <button
          className={`nle-tab-btn ${filterType === 'video' ? 'active' : ''}`}
          onClick={() => setFilterType('video')}
        >
          Video
        </button>
        <button
          className={`nle-tab-btn ${filterType === 'audio' ? 'active' : ''}`}
          onClick={() => setFilterType('audio')}
        >
          Audio
        </button>
        <button
          className={`nle-tab-btn ${filterType === 'image' ? 'active' : ''}`}
          onClick={() => setFilterType('image')}
        >
          Stills
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        className={`nle-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {importing ? (
          <span style={{ fontSize: 12, color: '#e4b363' }}>Processing media...</span>
        ) : (
          <span style={{ fontSize: 11, color: '#71717a' }}>
            Drag & drop media files here or click Import
          </span>
        )}
      </div>

      {/* Asset List */}
      <div className="nle-asset-list">
        {filteredAssets.length === 0 ? (
          <div className="nle-empty-assets">
            <Layers size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>No media assets found.</p>
            <span style={{ fontSize: 11, color: '#71717a' }}>
              Import footage, music or still graphics to begin.
            </span>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div key={asset.id} className="nle-asset-card">
              {/* Thumbnail */}
              <div className="asset-thumb-container">
                {asset.thumbnailUrl ? (
                  <img src={asset.thumbnailUrl} alt={asset.name} className="asset-thumb-img" />
                ) : (
                  <div className="asset-thumb-fallback">
                    {asset.type === 'video' && <Film size={20} />}
                    {asset.type === 'audio' && <Music size={20} />}
                    {asset.type === 'image' && <ImageIcon size={20} />}
                  </div>
                )}
                <span className="asset-type-badge">{asset.type}</span>
              </div>

              {/* Info & Metadata */}
              <div className="asset-info">
                <span className="asset-name" title={asset.name}>
                  {asset.name}
                </span>
                <div className="asset-meta">
                  <span className="meta-time">
                    <Clock size={11} style={{ marginRight: 3 }} />
                    {formatTimeDisplay(asset.durationFrames, project.fps || 30)}
                  </span>
                  {asset.width && asset.height && (
                    <span className="meta-res">{asset.width}x{asset.height}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="asset-actions">
                <button
                  onClick={() => handleAddAssetToTimeline(asset)}
                  className="asset-action-btn add"
                  title="Add to timeline at playhead"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => removeAsset(asset.id)}
                  className="asset-action-btn del"
                  title="Remove asset"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
