import React from 'react';
import { Link } from 'react-router-dom';

export const HomeFooter: React.FC = () => {
  return (
    <footer className="studio-footer">
      <div className="studio-container">
        <div className="footer-row">
          <div>
            <span style={{ fontWeight: 700, letterSpacing: '0.12em', color: '#fafafa', fontSize: 13 }}>
              PIXEL MEDIA
            </span>
            <span style={{ margin: '0 10px', color: '#3f3f46' }}>—</span>
            <span>Creative Post-Production Studio</span>
          </div>

          <div className="footer-nav-links">
            <a href="#work">Work</a>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <Link to="/login">Client Portal</Link>
            <Link to="/editor">Editor Preview</Link>
          </div>

          <div>
            <span>© {new Date().getFullYear()} Pixel Media. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
