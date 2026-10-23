import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Save, CheckCircle2, AlertCircle, Eye, ExternalLink, Globe, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ExperienceLevel, Availability } from '../../types';

export const EditorProfileSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [headline, setHeadline] = useState(user?.headline || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [startingPrice, setStartingPrice] = useState<number | ''>(user?.startingPrice || 350);
  const [contactForQuote, setContactForQuote] = useState(user?.contactForQuote || false);
  const [availability, setAvailability] = useState<Availability>(user?.availability || 'available');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(user?.experienceLevel || 'pro');
  const [location, setLocation] = useState(user?.location || '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || '');
  const [isPublished, setIsPublished] = useState(user?.isPublished ?? true);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      await updateProfile({
        headline: headline.trim(),
        bio: bio.trim(),
        startingPrice: contactForQuote || startingPrice === '' ? undefined : Number(startingPrice),
        contactForQuote,
        availability,
        experienceLevel,
        location: location.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        isPublished,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 840 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 className="text-title-1" style={{ marginBottom: 4 }}>
            Editor Profile & Rate Settings
          </h2>
          <p className="text-body">
            Configure your professional public profile, baseline project rates, and availability.
          </p>
        </div>

        {user && (
          <Link
            to={`/editors/${user.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Eye size={15} />
            <span>View Public Profile</span>
            <ExternalLink size={13} />
          </Link>
        )}
      </div>

      {saved && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34d399',
            fontSize: 13.5,
            marginBottom: 20,
          }}
        >
          <CheckCircle2 size={16} />
          <span>Profile updated successfully! Changes are live on your public page.</span>
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-danger-subtle)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: 13.5,
            marginBottom: 20,
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-surface)', padding: 28, borderRadius: 16, border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Availability & Public Status Toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, padding: '16px 20px', background: 'var(--bg-surface-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
          <div>
            <label className="form-label" style={{ marginBottom: 6 }}>Availability for New Clients</label>
            <select
              className="form-control"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as Availability)}
            >
              <option value="available">🟢 Available for new projects now</option>
              <option value="busy">🟡 Busy (Accepting projects next week)</option>
              <option value="unavailable">⚪ Unavailable / Fully booked</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ marginBottom: 6 }}>Public Marketplace Visibility</label>
            <select
              className="form-control"
              value={isPublished ? 'published' : 'hidden'}
              onChange={(e) => setIsPublished(e.target.value === 'published')}
            >
              <option value="published">Visible in Explore / Directory</option>
              <option value="hidden">Hidden (Only direct link accessible)</option>
            </select>
          </div>
        </div>

        {/* Headline */}
        <div className="form-group">
          <label htmlFor="profile-headline" className="form-label">Professional Headline *</label>
          <input
            id="profile-headline"
            type="text"
            required
            className="form-control"
            placeholder="e.g. Senior Commercial & Narrative Video Editor | Colorist (ACES/DaVinci)"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </div>

        {/* Rates & Tier */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label htmlFor="profile-starting-price" className="form-label" style={{ margin: 0 }}>Starting Project Rate (USD)</label>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={contactForQuote}
                  onChange={(e) => setContactForQuote(e.target.checked)}
                />
                <span>Contact for quote</span>
              </label>
            </div>
            <input
              id="profile-starting-price"
              type="number"
              className="form-control"
              placeholder="e.g. 450"
              value={startingPrice}
              onChange={(e) => setStartingPrice(e.target.value ? Number(e.target.value) : '')}
              disabled={contactForQuote}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Experience Tier</label>
            <select
              className="form-control"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
            >
              <option value="pro">Pro / Studio Level (5+ Years)</option>
              <option value="beginner">Rising Creator / Intermediate</option>
            </select>
          </div>
        </div>

        {/* Location & Website */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={14} />
              <span>Location / Timezone</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Los Angeles, CA (PST)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Globe size={14} />
              <span>Personal Website or Showreel</span>
            </label>
            <input
              type="url"
              className="form-control"
              placeholder="https://yourportfolio.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>
        </div>

        {/* Bio */}
        <div className="form-group">
          <label className="form-label">Creative Biography & Workflow</label>
          <textarea
            rows={5}
            className="form-control"
            placeholder="Tell clients about your creative philosophy, notable projects, clients worked with, and turnaround pacing..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
          >
            <Save size={16} />
            <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
