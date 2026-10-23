import React from 'react';
import { Link } from 'react-router-dom';
import { Clapperboard, Search, User, Globe, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { SupportedLanguage } from '../../types';

export const MarketplaceNavbar: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { language, setLanguage, supportedLanguages, t } = useLanguage();

  const handleToggleRole = async () => {
    if (!user) return;
    const nextRole = user.role === 'client' ? 'editor' : 'client';
    await switchRole(nextRole);
  };

  return (
    <header className="marketplace-nav">
      {/* Brand Logo */}
      <Link to="/" className="marketplace-logo">
        <div className="marketplace-logo-icon">
          <Clapperboard size={20} />
        </div>
        <span>Pixel Pedia</span>
      </Link>

      {/* Nav Links */}
      <nav className="marketplace-nav-links">
        <Link to="/explore" className="marketplace-nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Search size={15} />
          <span>Find Editors</span>
        </Link>
        <Link to="/explore?category=video-editing" className="marketplace-nav-link">
          Commercial & Film
        </Link>
        <Link to="/explore?category=motion-graphics" className="marketplace-nav-link">
          3D Motion
        </Link>
        <Link to="/explore?category=color-grading" className="marketplace-nav-link">
          Color Grading
        </Link>
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Language selector */}
        <div className="lang-selector" style={{ padding: '4px 8px' }}>
          <Globe size={14} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            aria-label={t.common.language}
            style={{ fontSize: 12.5 }}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Role switch toggle pill */}
            <button
              onClick={handleToggleRole}
              title={`Currently in ${user.role} mode. Click to toggle role.`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: 600,
                background: user.role === 'editor' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                border: user.role === 'editor' ? '1px solid rgba(168, 85, 247, 0.35)' : '1px solid rgba(99, 102, 241, 0.35)',
                color: user.role === 'editor' ? '#c084fc' : '#818cf8',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={12} />
              <span style={{ textTransform: 'capitalize' }}>{user.role} Mode</span>
            </button>

            {/* Dashboard Link */}
            <Link to="/dashboard/overview" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} />
              <span>Dashboard</span>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Log In
            </Link>
            <Link to="/signup" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>Join as Editor</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
