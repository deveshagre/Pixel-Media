import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HomeNavbarProps {
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onStartProject: () => void;
}

export const HomeNavbar: React.FC<HomeNavbarProps> = ({
  reducedMotion,
  onToggleReducedMotion,
  onStartProject,
}) => {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <header className="studio-nav" role="banner">
      <div className="studio-container">
        <div className="studio-nav-inner">
          {/* Wordmark */}
          <Link to="/" className="studio-wordmark" aria-label="Pixel Media Home">
            <span>PIXEL MEDIA</span>
            <span className="dot" aria-hidden="true" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav aria-label="Primary Navigation">
            <ul className="studio-nav-links">
              <li>
                <a href="#work" className="studio-nav-link">
                  Work
                </a>
              </li>
              <li>
                <a href="#services" className="studio-nav-link">
                  Services
                </a>
              </li>
              <li>
                <a href="#about" className="studio-nav-link">
                  About
                </a>
              </li>
              <li>
                <Link to="/login" className="studio-nav-link">
                  Login
                </Link>
              </li>
              {user && (
                <li>
                  <Link to="/dashboard/overview" className="studio-nav-link">
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Top Navigation Actions */}
          <div className="studio-nav-actions">
            <button
              onClick={onToggleReducedMotion}
              className="studio-btn-subtle"
              style={{ fontSize: 12 }}
              title="Toggle reduced motion preferences"
              aria-label="Toggle reduced motion"
            >
              {reducedMotion ? 'Motion: Off' : 'Motion: On'}
            </button>

            <button onClick={onStartProject} className="studio-btn-primary">
              <span>Start a project</span>
              <ArrowUpRight size={14} />
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="studio-mobile-toggle"
              aria-label="Open mobile navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Clean Mobile Slide Drawer */}
      {drawerOpen && (
        <div className="studio-drawer" role="dialog" aria-modal="true">
          <div className="studio-drawer-header">
            <span className="studio-wordmark">PIXEL MEDIA</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="studio-mobile-toggle"
              style={{ display: 'flex' }}
              aria-label="Close menu"
            >
              <X size={22} />
            </button>
          </div>

          <div className="studio-drawer-links">
            <a
              href="#work"
              onClick={() => setDrawerOpen(false)}
              className="studio-drawer-link"
            >
              Work
            </a>
            <a
              href="#services"
              onClick={() => setDrawerOpen(false)}
              className="studio-drawer-link"
            >
              Services
            </a>
            <a
              href="#about"
              onClick={() => setDrawerOpen(false)}
              className="studio-drawer-link"
            >
              About
            </a>
            <Link
              to="/login"
              onClick={() => setDrawerOpen(false)}
              className="studio-drawer-link"
            >
              Login
            </Link>
            {user && (
              <Link
                to="/dashboard/overview"
                onClick={() => setDrawerOpen(false)}
                className="studio-drawer-link"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 24 }}>
            <button
              onClick={() => {
                setDrawerOpen(false);
                onStartProject();
              }}
              className="studio-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            >
              <span>Start a project</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
