import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  Layers,
  MessageSquare,
  Cpu,
  ArrowLeft,
  Clapperboard,
  Sparkles,
} from 'lucide-react';

export const EditorPlaceholder: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        padding: '36px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: 760, width: '100%', textAlign: 'center' }}>
        {/* Phase 2 Badge */}
        <div style={{ display: 'inline-flex', marginBottom: 18 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-subtle)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            <Sparkles size={14} />
            <span>{t.editorPlaceholder.badge}</span>
          </span>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-title-1" style={{ fontSize: 32, marginBottom: 12 }}>
          {t.editorPlaceholder.title}
        </h1>
        <p
          className="text-body"
          style={{
            fontSize: 16,
            maxWidth: 580,
            margin: '0 auto 28px',
            color: 'var(--text-secondary)',
          }}
        >
          {t.editorPlaceholder.tagline}
        </p>

        {/* Mock Editor Canvas Preview Frame */}
        <div
          className="card"
          style={{
            padding: 24,
            marginBottom: 32,
            textAlign: 'left',
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-default)',
          }}
        >
          {/* Mock Timeline Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: 14,
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <Clapperboard size={15} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                Timeline Engine Preview (Canvas WebGL / WebCodecs)
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}
            >
              00:01:24:18 / 00:03:00:00
            </span>
          </div>

          {/* Timeline Tracks Visual Mock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {/* Video Track 1 */}
            <div
              style={{
                height: 38,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: '#818cf8', width: 40 }}>V1</span>
              <div
                style={{
                  flex: 1,
                  height: 24,
                  borderRadius: 3,
                  backgroundColor: 'rgba(99, 102, 241, 0.25)',
                  border: '1px solid rgba(99, 102, 241, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 8,
                  fontSize: 11,
                  color: '#c7d2fe',
                }}
              >
                Camera_A_Commercial_Take4_ProRes422.mov [ACEScc Grade]
              </div>
            </div>

            {/* Audio Track 1 */}
            <div
              style={{
                height: 38,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: '#34d399', width: 40 }}>A1</span>
              <div
                style={{
                  width: '60%',
                  height: 24,
                  borderRadius: 3,
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 8,
                  fontSize: 11,
                  color: '#a7f3d0',
                }}
              >
                Master_Score_Dynamic_Theme_96kHz.wav
              </div>
            </div>

            {/* Graphics Track */}
            <div
              style={{
                height: 38,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: '#fbbf24', width: 40 }}>GFX</span>
              <div
                style={{
                  width: '45%',
                  marginLeft: '20%',
                  height: 24,
                  borderRadius: 3,
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 8,
                  fontSize: 11,
                  color: '#fde68a',
                }}
              >
                Kinetic_Title_3D_Reveal.lottie
              </div>
            </div>
          </div>

          <p
            className="text-caption"
            style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}
          >
            {t.editorPlaceholder.description}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 32,
            textAlign: 'left',
          }}
        >
          <div className="card" style={{ padding: 18 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-subtle)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Layers size={18} />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {t.editorPlaceholder.feature1Title}
            </h4>
            <p className="text-caption">{t.editorPlaceholder.feature1Desc}</p>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-info-subtle)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <MessageSquare size={18} />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {t.editorPlaceholder.feature2Title}
            </h4>
            <p className="text-caption">{t.editorPlaceholder.feature2Desc}</p>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-success-subtle)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <Cpu size={18} />
            </div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
              {t.editorPlaceholder.feature3Title}
            </h4>
            <p className="text-caption">{t.editorPlaceholder.feature3Desc}</p>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={() => navigate('/dashboard/overview')}
            className="btn btn-primary btn-lg"
          >
            <ArrowLeft size={18} />
            <span>{t.editorPlaceholder.backToDashboard}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
