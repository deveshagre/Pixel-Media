import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClientData } from '../../context/ClientDataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';
import {
  Film,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Plus,
  FolderOpen,
  Calendar,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { ServiceCategory } from '../../types';

interface OutletContextType {
  openRequestModal: (category?: ServiceCategory) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const OverviewSection: React.FC = () => {
  const { user } = useAuth();
  const { projects, stats, loading } = useClientData();
  const { t } = useLanguage();
  const { openRequestModal } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();

  const getCategoryLabel = (category: ServiceCategory) => {
    return t.categories[category] || category;
  };

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h2 className="text-title-1">
            {t.overview.welcome}, {user?.fullName || 'Client'}
          </h2>
          {user?.company && (
            <span
              style={{
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-subtle)',
                color: '#a5b4fc',
                fontWeight: 600,
              }}
            >
              {user.company}
            </span>
          )}
        </div>
        <p className="text-body">{t.overview.subtitle}</p>
      </div>

      {/* Metric Counters */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo">
            <Film size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">{t.overview.activeProjects}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.inReview}</div>
            <div className="stat-label">{t.overview.inReview}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">{t.overview.completed}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-sky">
            <HelpCircle size={22} />
          </div>
          <div>
            <div className="stat-value">{stats.openTickets}</div>
            <div className="stat-label">{t.overview.supportTickets}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div style={{ marginBottom: 36 }}>
        <h3 className="text-title-3" style={{ marginBottom: 14 }}>
          {t.overview.quickActions}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          <div
            className="card card-interactive"
            onClick={() => openRequestModal()}
            style={{ cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start' }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-subtle)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Plus size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                {t.overview.requestService}
              </h4>
              <p className="text-caption">{t.overview.requestServiceDesc}</p>
            </div>
          </div>

          {/* Open Video Editor Studio */}
          <div
            className="card card-interactive"
            onClick={() => navigate('/editor')}
            style={{ cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start' }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(228, 179, 99, 0.15)',
                color: '#e4b363',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Film size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Open Video Editor</span>
                <span className="badge badge-indigo" style={{ fontSize: 10 }}>STUDIO</span>
              </h4>
              <p className="text-caption">Launch the browser-based nonlinear timeline & motion graphics workspace.</p>
            </div>
          </div>

          <div
            className="card card-interactive"
            onClick={() => navigate('/dashboard/portfolio')}
            style={{ cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start' }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-info-subtle)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FolderOpen size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                {t.overview.viewPortfolio}
              </h4>
              <p className="text-caption">{t.overview.viewPortfolioDesc}</p>
            </div>
          </div>

          <div
            className="card card-interactive"
            onClick={() => navigate('/dashboard/help')}
            style={{ cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start' }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-warning-subtle)',
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <HelpCircle size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                {t.overview.newTicket}
              </h4>
              <p className="text-caption">{t.overview.newTicketDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Production Pipeline / Projects List */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <h3 className="text-title-3">{t.overview.recentProjects}</h3>
          <span className="text-caption">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} active
          </span>
        </div>

        {loading ? (
          <div className="card" style={{ padding: 36, textAlign: 'center' }}>
            <p className="text-body">{t.common.loading}</p>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={Layers}
            title={t.overview.noProjectsTitle}
            description={t.overview.noProjectsDesc}
            actionText={t.overview.startFirstProject}
            onAction={() => openRequestModal()}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {projects.map((project) => (
              <div
                key={project.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  padding: '18px 22px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <Film size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {project.title}
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          marginTop: 2,
                        }}
                      >
                        <span>{getCategoryLabel(project.category)}</span>
                        {project.deadline && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} />
                              {project.deadline}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Badge status={project.status} />
                    {project.deliverablesUrl && (
                      <a
                        href={project.deliverablesUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        title="Open Cloud Deliverables Folder"
                      >
                        <ExternalLink size={14} />
                        <span>Deliverables</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      color: 'var(--text-muted)',
                      marginBottom: 6,
                    }}
                  >
                    <span>{project.description || 'Production pipeline'}</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
