import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Sparkles,
  HelpCircle,
  Video,
  LogOut,
  X,
  Clapperboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard/overview', label: t.nav.overview, icon: LayoutDashboard },
    { to: '/dashboard/portfolio', label: t.nav.portfolio, icon: FolderKanban },
    { to: '/dashboard/services', label: t.nav.services, icon: Sparkles },
    { to: '/dashboard/help', label: t.nav.help, icon: HelpCircle },
    {
      to: '/editor',
      label: t.nav.editor,
      icon: Video,
      badge: t.nav.phase2Badge,
    },
  ];

  return (
    <>
      {mobileOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-badge">
            <div className="logo-icon-wrapper">
              <Clapperboard size={18} />
            </div>
            <span>{t.nav.clientPortal}</span>
          </div>
          <button
            onClick={onCloseMobile}
            className="mobile-menu-btn"
            aria-label="Close sidebar navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="phase-badge">{item.badge}</span>}
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
                <div className="user-company" title={user.email}>
                  {user.company || user.email}
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
