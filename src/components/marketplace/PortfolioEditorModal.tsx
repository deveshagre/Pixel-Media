import React, { useState } from 'react';
import { X, Save, AlertCircle, Wrench, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useCategories } from '../../hooks/useMarketplace';
import { PortfolioItem, COMMON_SOFTWARE, PortfolioStatus } from '../../types';

interface PortfolioEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<PortfolioItem> & { id?: string }) => Promise<void>;
  initialItem?: PortfolioItem | null;
}

export const PortfolioEditorModal: React.FC<PortfolioEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const { flatCategories } = useCategories();

  const [title, setTitle] = useState(initialItem?.title || '');
  const [categoryId, setCategoryId] = useState(initialItem?.categoryId || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(initialItem?.thumbnailUrl || initialItem?.thumbnail || '');
  const [mediaUrl, setMediaUrl] = useState(initialItem?.mediaUrl || '');
  const [externalLink, setExternalLink] = useState(initialItem?.externalLink || '');
  const [editorRole, setEditorRole] = useState(initialItem?.editorRole || 'Lead Video Editor');
  const [projectDuration, setProjectDuration] = useState(initialItem?.projectDuration || initialItem?.durationOrScope || '');
  const [description, setDescription] = useState(initialItem?.description || '');
  const [status, setStatus] = useState<PortfolioStatus>(initialItem?.status || 'published');
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>(initialItem?.softwareUsed || ['Adobe Premiere Pro']);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSoftware = (sw: string) => {
    if (selectedSoftware.includes(sw)) {
      setSelectedSoftware(selectedSoftware.filter((s) => s !== sw));
    } else {
      setSelectedSoftware([...selectedSoftware, sw]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide a title for the portfolio piece.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: initialItem?.id,
        title: title.trim(),
        categoryId: categoryId || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        mediaUrl: mediaUrl.trim() || undefined,
        externalLink: externalLink.trim() || undefined,
        editorRole: editorRole.trim() || undefined,
        projectDuration: projectDuration.trim() || undefined,
        description: description.trim() || undefined,
        softwareUsed: selectedSoftware,
        status,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save portfolio item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            {initialItem ? 'Edit Portfolio Piece' : 'Add New Portfolio Work'}
          </h3>
          <button
            onClick={onClose}
            className="mobile-menu-btn"
            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-danger-subtle)',
                  color: '#fca5a5',
                  fontSize: 13,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Project Title *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Apex Horizon — 60s Commercial Cut"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category / Discipline</label>
                <select
                  className="form-control"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Select Category...</option>
                  {flatCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ImageIcon size={14} />
                  <span>Cover / Thumbnail Image URL</span>
                </label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/... or direct image URL"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <LinkIcon size={14} />
                  <span>Direct Video / Media URL (MP4)</span>
                </label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/reel.mp4"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LinkIcon size={14} />
                <span>External Reel Link (YouTube / Vimeo / Drive / Behance)</span>
              </label>
              <input
                type="url"
                className="form-control"
                placeholder="https://www.youtube.com/watch?v=..."
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Your Role on Project</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Lead Editor & Colorist"
                  value={editorRole}
                  onChange={(e) => setEditorRole(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration / Deliverable Format</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 60s Master + 3 Social Cuts"
                  value={projectDuration}
                  onChange={(e) => setProjectDuration(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Description & Technical Execution</label>
              <textarea
                rows={3}
                className="form-control"
                placeholder="Explain the narrative flow, pacing challenges, color science (ACES/Log), audio sound design..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Software multi-select */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Wrench size={14} />
                <span>Software & Tools Used</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 120, overflowY: 'auto', padding: '4px 0' }}>
                {COMMON_SOFTWARE.map((sw) => {
                  const selected = selectedSoftware.includes(sw);
                  return (
                    <button
                      key={sw}
                      type="button"
                      onClick={() => toggleSoftware(sw)}
                      className={`filter-chip ${selected ? 'active' : ''}`}
                      style={{ fontSize: 11.5 }}
                    >
                      {sw}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status */}
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <label className="form-label" style={{ margin: 0 }}>Visibility Status:</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                />
                <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>Published (Public)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                />
                <span style={{ color: 'var(--text-muted)' }}>Draft (Hidden)</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={15} />
              <span>{saving ? 'Saving Piece...' : 'Save Portfolio Piece'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
