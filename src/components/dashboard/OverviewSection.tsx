import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProjectRequests, usePortfolioManager, useReports, useEditorDiscovery } from '../../hooks/useMarketplace';
import { Report } from '../../types';
import {
  Inbox,
  Film,
  CheckCircle,
  Plus,
  Search,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Layers,
} from 'lucide-react';

export const OverviewSection: React.FC = () => {
  const { user } = useAuth();
  const { requests, loading: reqLoading } = useProjectRequests();
  const { items: portfolioItems } = usePortfolioManager();
  const { reports } = useReports();
  const { editors } = useEditorDiscovery({});

  const isEditor = user?.role === 'editor';
  const isAdmin = user?.role === 'admin';

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');
  const completedRequests = requests.filter((r) => r.status === 'completed');

  return (
    <div>
      {/* Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <h2 className="text-title-1">
              Welcome back, {user?.fullName || 'Creator'}
            </h2>
            <span
              style={{
                fontSize: 12,
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isEditor ? 'rgba(168, 85, 247, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                color: isEditor ? '#c084fc' : '#818cf8',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {user?.role} Portal
            </span>
          </div>
          <p className="text-body">
            {isEditor
              ? 'Manage your editing pipeline, respond to briefs, and showcase your best work.'
              : isAdmin
              ? 'Marketplace health, trust & safety reports, and platform oversight.'
              : 'Track your video briefs, review editor milestone progress, and discover top creative talent.'}
          </p>
        </div>

        {/* Primary CTA button */}
        {isEditor ? (
          <Link to="/dashboard/portfolio" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} />
            <span>Add Portfolio Work</span>
          </Link>
        ) : isAdmin ? (
          <Link to="/dashboard/moderation" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldAlert size={16} />
            <span>Moderation Queue</span>
          </Link>
        ) : (
          <Link to="/explore" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={16} />
            <span>Explore Editors</span>
          </Link>
        )}
      </div>

      {/* Stats Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {isEditor ? (
          <>
            <div className="card-interactive" style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="text-caption">Pending Inquiries</span>
                <Inbox size={20} color="#fbbf24" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{pendingRequests.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Awaiting your acceptance
              </div>
            </div>

            <div className="card-interactive" style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="text-caption">Active Jobs</span>
                <Clock size={20} color="var(--primary)" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{acceptedRequests.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                In active post-production
              </div>
            </div>

            <div className="card-interactive" style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="text-caption">Published Works</span>
                <Film size={20} color="#34d399" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{portfolioItems.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Showcased on your profile
              </div>
            </div>

            <div className="card-interactive" style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="text-caption">Starting Rate</span>
                <DollarSign size={20} color="#a855f7" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                {user?.startingPrice ? `$${user.startingPrice}` : 'Custom'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {user?.availability === 'available' ? '🟢 Available' : '🟡 Busy'}
              </div>
            </div>
          </>
        ) : isAdmin ? (
          <>
            <div className="card-interactive" style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="text-caption">Pending Reports</span>
                <ShieldAlert size={20} color="var(--accent-warning)" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                {reports.filter((r: Report) => r.status === 'pending').length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Requires moderator action
              </div>
            </div>

            <div className="card-interactive" style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="text-caption">Verified Editors</span>
                <Layers size={20} color="var(--primary)" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{editors.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Active creators on platform
              </div>
            </div>

            <div className="card-interactive" style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="text-caption">Total Briefs Dispatched</span>
                <Inbox size={20} color="#34d399" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{requests.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Across all disciplines
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card-interactive" style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="text-caption">Active Briefs</span>
                <Inbox size={20} color="var(--primary)" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>
                {pendingRequests.length + acceptedRequests.length}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                {pendingRequests.length} pending, {acceptedRequests.length} in production
              </div>
            </div>

            <div className="card-interactive" style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="text-caption">Completed Projects</span>
                <CheckCircle size={20} color="#34d399" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{completedRequests.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Successfully delivered
              </div>
            </div>

            <div className="card-interactive" style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="text-caption">Verified Editors Available</span>
                <Search size={20} color="#818cf8" />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{editors.length}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Across 8 creative disciplines
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity / Requests Section */}
      <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>
            {isEditor ? 'Recent Client Inquiries' : 'Recent Project Requests'}
          </h3>
          <Link to="/dashboard/requests" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>View All</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {reqLoading ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: 16 }}>No requests to display.</p>
            {!isEditor && (
              <Link to="/explore" className="btn btn-primary btn-sm">
                Find an Editor & Submit Brief
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {requests.slice(0, 4).map((req) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '14px 18px',
                  borderRadius: 10,
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className={`status-badge ${req.status}`}>{req.status}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {req.title}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {req.budgetMin && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      ${req.budgetMin} {req.budgetMax ? `– $${req.budgetMax}` : ''}
                    </div>
                  )}
                  <Link to="/dashboard/requests" className="btn btn-secondary btn-sm">
                    Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
