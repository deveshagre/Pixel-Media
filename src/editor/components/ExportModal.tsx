import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  X,
  CheckCircle2,
  Loader2,
  Film,
} from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { ExportSettings, Resolution } from '../types';
import {
  detectSupportedExportFormats,
  renderAndExportVideo,
  downloadVideoBlob,
  ExportCancellation,
  ExportProgress,
} from '../engine/exportEngine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { project } = useEditor();

  const [supportedFormats, setSupportedFormats] = useState({
    mp4: false,
    webm: true,
    mimeType: 'video/webm',
    extension: 'webm' as 'mp4' | 'webm',
  });

  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'webm'>('webm');
  const [resolutionPreset, setResolutionPreset] = useState<'1080p' | '720p'>('1080p');
  const [qualityPreset, setQualityPreset] = useState<'high' | 'standard' | 'fast'>('standard');
  const [isRendering, setIsRendering] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [exportedResult, setExportedResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const cancellationRef = useRef<ExportCancellation | null>(null);

  useEffect(() => {
    if (isOpen) {
      const detected = detectSupportedExportFormats();
      setSupportedFormats(detected);
      setSelectedFormat(detected.mp4 ? 'mp4' : 'webm');
      setIsRendering(false);
      setProgress(null);
      setExportedResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsRendering(true);
    setExportedResult(null);
    cancellationRef.current = new ExportCancellation();

    let res: Resolution = { width: 1920, height: 1080 };
    if (project.aspectRatio === '9:16') {
      res = resolutionPreset === '1080p' ? { width: 1080, height: 1920 } : { width: 720, height: 1280 };
    } else if (project.aspectRatio === '1:1') {
      res = resolutionPreset === '1080p' ? { width: 1080, height: 1080 } : { width: 720, height: 720 };
    } else {
      res = resolutionPreset === '1080p' ? { width: 1920, height: 1080 } : { width: 1280, height: 720 };
    }

    const bitrateMap = {
      high: 12_000_000,
      standard: 6_000_000,
      fast: 3_000_000,
    };

    const settings: ExportSettings = {
      format: selectedFormat,
      resolution: res,
      aspectRatio: project.aspectRatio,
      fps: project.fps || 30,
      bitrate: bitrateMap[qualityPreset],
      quality: qualityPreset,
    };

    try {
      const result = await renderAndExportVideo(
        project,
        settings,
        (p) => setProgress(p),
        cancellationRef.current
      );
      setExportedResult(result);
      setIsRendering(false);
      // Auto-trigger download
      downloadVideoBlob(result.blob, result.filename);
    } catch (err: any) {
      if (err.message !== 'Export cancelled by user.') {
        alert(`Export failed: ${err.message}`);
      }
      setIsRendering(false);
    }
  };

  const handleCancel = () => {
    if (cancellationRef.current) {
      cancellationRef.current.cancel();
    }
    setIsRendering(false);
    setProgress(null);
  };

  return (
    <div className="nle-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
      <div className="nle-modal-card">
        {/* Header */}
        <div className="nle-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Film size={18} className="text-amber" />
            <h2 id="export-modal-title" className="nle-modal-title">
              Export Master Video
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isRendering}
            className="nle-modal-close-btn"
            title="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="nle-modal-body">
          {!isRendering && !exportedResult && (
            <>
              {/* Format selection */}
              <div className="modal-field-group">
                <label className="modal-label">Output Format Container</label>
                <div className="modal-options-grid">
                  <button
                    className={`modal-opt-btn ${selectedFormat === 'mp4' ? 'active' : ''}`}
                    onClick={() => setSelectedFormat('mp4')}
                    disabled={!supportedFormats.mp4}
                  >
                    <span className="opt-title">MP4 (H.264)</span>
                    <span className="opt-sub">
                      {supportedFormats.mp4
                        ? 'Universal playback'
                        : 'Not supported in this browser'}
                    </span>
                  </button>

                  <button
                    className={`modal-opt-btn ${selectedFormat === 'webm' ? 'active' : ''}`}
                    onClick={() => setSelectedFormat('webm')}
                  >
                    <span className="opt-title">WebM (VP9/VP8)</span>
                    <span className="opt-sub">High efficiency web video</span>
                  </button>
                </div>
              </div>

              {/* Resolution selection */}
              <div className="modal-field-group">
                <label className="modal-label">Render Resolution ({project.aspectRatio})</label>
                <div className="modal-options-grid">
                  <button
                    className={`modal-opt-btn ${resolutionPreset === '1080p' ? 'active' : ''}`}
                    onClick={() => setResolutionPreset('1080p')}
                  >
                    <span className="opt-title">1080p Full HD</span>
                    <span className="opt-sub">Production Master</span>
                  </button>
                  <button
                    className={`modal-opt-btn ${resolutionPreset === '720p' ? 'active' : ''}`}
                    onClick={() => setResolutionPreset('720p')}
                  >
                    <span className="opt-title">720p HD</span>
                    <span className="opt-sub">Fast draft review</span>
                  </button>
                </div>
              </div>

              {/* Quality */}
              <div className="modal-field-group">
                <label className="modal-label">Bitrate & Encoding Quality</label>
                <select
                  className="modal-select"
                  value={qualityPreset}
                  onChange={(e) => setQualityPreset(e.target.value as any)}
                >
                  <option value="high">High Bitrate (12 Mbps) • Maximum visual clarity</option>
                  <option value="standard">Standard Studio (6 Mbps) • Balanced</option>
                  <option value="fast">Fast Render (3 Mbps) • Lightweight</option>
                </select>
              </div>

              {/* Sequence Summary */}
              <div className="modal-summary-box">
                <div className="summary-row">
                  <span>Sequence Length:</span>
                  <span>{project.durationFrames} frames ({Math.round(project.durationFrames / project.fps)}s)</span>
                </div>
                <div className="summary-row">
                  <span>Aspect Ratio:</span>
                  <span>{project.aspectRatio}</span>
                </div>
                <div className="summary-row">
                  <span>Active Visual Clips:</span>
                  <span>{project.clips.length} layers</span>
                </div>
              </div>
            </>
          )}

          {/* Active Rendering Progress */}
          {isRendering && progress && (
            <div className="modal-progress-view">
              <Loader2 size={32} className="spin text-amber" style={{ margin: '0 auto 14px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f4f4f5', marginBottom: 4 }}>
                {progress.status === 'encoding'
                  ? 'Finalizing Video Encoding...'
                  : `Rendering Frame ${progress.currentFrame} of ${progress.totalFrames}`}
              </h3>
              <p style={{ fontSize: 12, color: '#71717a', marginBottom: 20 }}>
                Compositing layers, keyframe transforms, typography, and audio.
              </p>

              {/* Progress bar */}
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="progress-percentage-label">{progress.percentage}%</span>

              <div style={{ marginTop: 24 }}>
                <button onClick={handleCancel} className="modal-btn-cancel">
                  Cancel Export
                </button>
              </div>
            </div>
          )}

          {/* Success Result */}
          {!isRendering && exportedResult && (
            <div className="modal-success-view">
              <CheckCircle2 size={38} className="text-emerald" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 6 }}>
                Master Video Generated Successfully!
              </h3>
              <p style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 16 }}>
                {exportedResult.filename} ({(exportedResult.blob.size / (1024 * 1024)).toFixed(2)} MB)
              </p>

              <button
                onClick={() => downloadVideoBlob(exportedResult.blob, exportedResult.filename)}
                className="modal-btn-download"
              >
                <Download size={15} />
                <span>Download Video File Again</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isRendering && !exportedResult && (
          <div className="nle-modal-footer">
            <button onClick={onClose} className="modal-btn-subtle">
              Cancel
            </button>
            <button onClick={handleStartExport} className="modal-btn-primary">
              <Download size={15} />
              <span>Start Render</span>
            </button>
          </div>
        )}

        {exportedResult && (
          <div className="nle-modal-footer">
            <button onClick={onClose} className="modal-btn-primary">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
