import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  HelpCircle,
  Inbox,
  Settings,
  ShieldAlert,
  Search,
  Eye,
  LogOut,
  X,
  Clapperboard,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { UserRole } from '../../types';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user, logout, switchRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRoleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await switchRole(e.target.value as UserRole);
  };

  const isEditor = user?.role === 'editor';
  const isAdmin = user?.role === 'admin';

  const getNavItems = () => {
    if (isAdmin) {
      return [
        { to: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
        { to: '/dashboard/moderation', label: 'Moderation Queue', icon: ShieldAlert },
        { to: '/dashboard/requests', label: 'All Requests', icon: Inbox },
        { to: '/dashboard/help', label: t.nav.help, icon: HelpCircle },
      ];
    }

    if (isEditor) {
      return [
        { to: '/dashboard/overview', label: 'Editor Overview', icon: LayoutDashboard },
        { to: '/dashboard/requests', label: 'Incoming Briefs', icon: Inbox },
        { to: '/dashboard/portfolio', label: 'Portfolio Works', icon: FolderKanban },
        { to: '/dashboard/profile', label: 'Profile & Rates', icon: Settings },
        { to: `/editors/${user?.id || 'editor-1'}`, label: 'Public Profile', icon: Eye, isExternal: true },
        { to: '/dashboard/help', label: t.nav.help, icon: HelpCircle },
      ];
    }

    // Default Client
    return [
      { to: '/dashboard/overview', label: 'Client Overview', icon: LayoutDashboard },
      { to: '/dashboard/requests', label: 'My Project Briefs', icon: Inbox },
      { to: '/explore', label: 'Find Editors', icon: Search },
      { to: '/dashboard/services', label: 'Services Catalog', icon: Sparkles },
      { to: '/dashboard/help', label: t.nav.help, icon: HelpCircle },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="logo-badge" style={{ textDecoration: 'none' }}>
            <div className="logo-icon-wrapper">
              <Clapperboard size={18} />
            </div>
            <span>Pixel Pedia</span>
          </Link>
          <button
            onClick={onCloseMobile}
            className="mobile-menu-btn"
            aria-label="Close sidebar navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Selector Card */}
        <div style={{ padding: '0 16px 12px' }}>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
              <span>CURRENT MODE</span>
              <RefreshCw size={11} color="var(--primary)" />
            </div>
            <select
              value={user?.role || 'client'}
              onChange={handleRoleChange}
              style={{
                background: 'transparent',
                border: 'none',
                color: user?.role === 'editor' ? '#c084fc' : user?.role === 'admin' ? '#fbbf24' : '#818cf8',
                fontWeight: 700,
                fontSize: 13,
                outline: 'none',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              <option value="client" style={{ background: '#11131c', color: '#fff' }}>Client (Hiring)</option>
              <option value="editor" style={{ background: '#11131c', color: '#fff' }}>Editor (Creator)</option>
              <option value="admin" style={{ background: '#11131c', color: '#fff' }}>Admin (Moderator)</option>
            </select>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.isExternal) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onCloseMobile}
                  className="nav-item"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            }
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-snippet">
              <div className="avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} />
                ) : (
                  user.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="user-info">
                <div className="user-name" title={user.fullName}>
                  {user.fullName}
                </div>
                <div className="user-company" title={user.email} style={{ textTransform: 'capitalize' }}>
                  {user.role} Account
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <LogOut size={16} />
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
