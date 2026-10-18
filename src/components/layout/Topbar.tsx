import React from 'react';
import { Menu, Globe, Plus, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SupportedLanguage } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  onOpenMobile: () => void;
  onRequestService: () => void;
  title: string;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobile, onRequestService, title }) => {
  const { language, setLanguage, supportedLanguages, t } = useLanguage();
  const { isConfigured } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          onClick={onOpenMobile}
          className="mobile-menu-btn"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-title-2" style={{ fontWeight: 600 }}>
          {title}
        </h1>
      </div>

      <div className="topbar-right">
        {/* Backend Status indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: 'var(--text-muted)',
            padding: '4px 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}
          title={
            isConfigured
              ? 'Connected to Supabase Production Cloud'
              : 'Local isolated client storage mode active. Connect Supabase via .env for cloud persistence.'
          }
        >
          <ShieldCheck size={14} color={isConfigured ? 'var(--accent-success)' : '#818cf8'} />
          <span className="hide-on-mobile">
            {isConfigured ? 'Supabase Connected' : 'Local Demo Vault'}
          </span>
        </div>

        {/* Language selector */}
        <div className="lang-selector">
          <Globe size={15} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            aria-label={t.common.language}
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeLabel} ({lang.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Primary CTA */}
        <button onClick={onRequestService} className="btn btn-primary btn-sm">
          <Plus size={16} />
          <span>{t.overview.requestService}</span>
        </button>
      </div>
    </header>
  );
};
