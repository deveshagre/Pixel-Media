import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useReports } from '../../hooks/useMarketplace';
import { ReportStatus, Report } from '../../types';

export const AdminModerationView: React.FC = () => {
  const { reports, loading, updateReportStatus } = useReports();
  const [filter, setFilter] = useState<ReportStatus | 'all'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleUpdate = async (id: string, status: ReportStatus) => {
    setProcessingId(id);
    try {
      await updateReportStatus(id, status);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = filter === 'all' ? reports : reports.filter((r: Report) => r.status === filter);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 className="text-title-1" style={{ marginBottom: 4 }}>
          Trust, Safety & Moderation
        </h2>
        <p className="text-body">
          Review reported portfolio items, misleading profiles, and copyright infringement claims.
        </p>
      </div>

      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 20 }}>
        {(['pending', 'resolved', 'dismissed', 'all'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={`filter-tab ${filter === st ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >
            {st} ({st === 'all' ? reports.length : reports.filter((r: Report) => r.status === st).length})
          </button>
        ))}
      </div>

      {/* Reports Table */}
      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading reports...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <CheckCircle2 size={40} style={{ color: 'var(--accent-success)', marginBottom: 12 }} />
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>All reports resolved</h3>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
            There are currently no {filter !== 'all' ? filter : ''} moderation items requiring review.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((rep) => (
            <div
              key={rep.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 14,
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`status-badge ${rep.status}`}>{rep.status}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Type: {rep.targetType.replace('_', ' ')}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Target ID: {rep.targetId}
                  </span>
                </div>

                {rep.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleUpdate(rep.id, 'resolved')}
                      disabled={processingId === rep.id}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}
                    >
                      Resolve & Action
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(rep.id, 'dismissed')}
                      disabled={processingId === rep.id}
                      className="btn btn-secondary btn-sm"
                    >
                      Dismiss Report
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent-warning)', marginBottom: 4 }}>
                  {rep.reason}
                </h4>
                {rep.details && (
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {rep.details}
                  </p>
                )}
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Reported on: {new Date(rep.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
