import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Film } from 'lucide-react';
import { usePortfolioManager } from '../../hooks/useMarketplace';
import { PortfolioItem } from '../../types';
import { PortfolioEditorModal } from '../marketplace/PortfolioEditorModal';

export const EditorPortfolioManager: React.FC = () => {
  const { items, loading, saveItem, deleteItem } = usePortfolioManager();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: PortfolioItem) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleTogglePublish = async (item: PortfolioItem) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    await saveItem({ ...item, status: nextStatus });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this portfolio item?')) {
      await deleteItem(id);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 className="text-title-1" style={{ marginBottom: 4 }}>
            Portfolio Manager
          </h2>
          <p className="text-body">
            Add and curate your creative portfolio showcase. Clients discover and evaluate you through these works.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} />
          <span>Add New Work</span>
        </button>
      </div>

      {/* Grid of Portfolio Items */}
      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your portfolio...
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <Film size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>Your portfolio is empty</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Upload your commercial cuts, YouTube reels, motion graphics, and color grading masters to attract clients.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
            Add First Piece
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ aspectRatio: '16 / 9', position: 'relative', background: '#000', overflow: 'hidden' }}>
                <img
                  src={item.thumbnailUrl || item.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=75'}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    fontWeight: 600,
                    background: item.status === 'published' ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)',
                    color: '#fff',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {item.status}
                </div>
              </div>

              <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>
                  {item.editorRole || 'Lead Editor'}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 14 }}>
                  {item.description || 'No description provided.'}
                </p>

                {item.softwareUsed && item.softwareUsed.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                    {item.softwareUsed.slice(0, 3).map((sw, i) => (
                      <span key={i} className="software-tag" style={{ fontSize: 10.5 }}>
                        {sw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Controls */}
                <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}
                  >
                    {item.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{item.status === 'published' ? 'Unpublish' : 'Publish'}</span>
                  </button>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      style={{ background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '4px 8px', color: 'var(--text-primary)', cursor: 'pointer' }}
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 6, padding: '4px 8px', color: 'var(--accent-danger)', cursor: 'pointer' }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <PortfolioEditorModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={async (item) => {
            await saveItem(item);
          }}
          initialItem={editingItem}
        />
      )}
    </div>
  );
};
