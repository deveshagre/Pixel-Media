import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBilling } from '../../hooks/useBilling';

const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
];

export const CreatorPayoutSettings: React.FC = () => {
  const { user } = useAuth();
  const { payoutProfile, saveCreatorPayoutProfile } = useBilling();

  const [legalName, setLegalName] = useState(payoutProfile?.legalName || user?.fullName || '');
  const [businessType, setBusinessType] = useState<'individual' | 'company'>(
    payoutProfile?.businessType || 'individual'
  );
  const [country, setCountry] = useState(payoutProfile?.country || 'US');
  const [billingEmail, setBillingEmail] = useState(
    payoutProfile?.billingEmail || user?.email || ''
  );
  const [addressLine1, setAddressLine1] = useState(payoutProfile?.addressLine1 || '');
  const [city, setCity] = useState(payoutProfile?.city || '');
  const [postalCode, setPostalCode] = useState(payoutProfile?.postalCode || '');
  const [taxIdType, setTaxIdType] = useState(payoutProfile?.taxIdType || 'ein');
  const [taxIdProvided, setTaxIdProvided] = useState(payoutProfile?.taxIdProvided || false);

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      await saveCreatorPayoutProfile({
        legalName: legalName.trim(),
        businessType,
        country,
        billingEmail: billingEmail.trim(),
        addressLine1: addressLine1.trim() || undefined,
        city: city.trim() || undefined,
        postalCode: postalCode.trim() || undefined,
        taxIdProvided,
        taxIdType: taxIdProvided ? taxIdType : undefined,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save business details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 780 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="text-title-1" style={{ marginBottom: 4 }}>
          Creator Business & Payout Readiness
        </h2>
        <p className="text-body">
          Configure your commercial billing identity and invoicing details. Project compensation is arranged and settled directly between you and your client.
        </p>
      </div>

      {/* Payout Status Card */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: 14,
          background: 'rgba(52, 211, 153, 0.08)',
          border: '1px solid rgba(52, 211, 153, 0.25)',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <Building2 size={24} style={{ color: '#34d399', marginTop: 2, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#34d399', marginBottom: 2 }}>
              DIRECT SETTLEMENT READY
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Commercial Invoicing Profile
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Your business and tax details appear on project invoices. Clients settle milestone deliverables directly with you.
            </div>
          </div>
        </div>

        <div>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'rgba(52, 211, 153, 0.15)',
              color: '#34d399',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
            }}
          >
            DIRECT SETTLEMENT
          </span>
        </div>
      </div>

      {/* Security & Non-collection Disclaimer */}
      <div
        style={{
          padding: '14px 18px',
          borderRadius: 10,
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <ShieldCheck size={20} color="#34d399" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Secure Direct Payment Architecture:</strong>{' '}
          Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments.
        </div>
      </div>

      {savedSuccess && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            color: '#34d399',
            fontSize: 13.5,
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <CheckCircle2 size={16} />
          <span>Business profile saved successfully.</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: 13.5,
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      {/* Business Details Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 14,
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Commercial Entity & Invoicing Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {/* Legal Name */}
            <div>
              <label htmlFor="legalName" className="form-label" style={{ fontSize: 12.5, fontWeight: 600 }}>
                Legal Name / Registered Business *
              </label>
              <input
                id="legalName"
                type="text"
                required
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Elena Rostova or Rostova Cinema LLC"
                className="form-input"
              />
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="businessType" className="form-label" style={{ fontSize: 12.5, fontWeight: 600 }}>
                Entity Classification *
              </label>
              <select
                id="businessType"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as 'individual' | 'company')}
                className="form-input"
              >
                <option value="individual">Individual / Sole Proprietor</option>
                <option value="company">Registered Company / Corporation / LLC</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {/* Country */}
            <div>
              <label htmlFor="country" className="form-label" style={{ fontSize: 12.5, fontWeight: 600 }}>
                Country of Tax Residence *
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="form-input"
              >
                {SUPPORTED_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Billing Email */}
            <div>
              <label htmlFor="billingEmail" className="form-label" style={{ fontSize: 12.5, fontWeight: 600 }}>
                Official Invoicing Email *
              </label>
              <input
                id="billingEmail"
                type="email"
                required
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                placeholder="billing@yourdomain.com"
                className="form-input"
              />
            </div>
          </div>

          {/* Address Line & City */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
            <div>
              <label htmlFor="addressLine1" className="form-label" style={{ fontSize: 12.5, fontWeight: 600 }}>
                Business Address (Optional)
              </label>
              <input
                id="addressLine1"
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Street address"
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="city" className="form-label" style={{ fontSize: 12.5, fontWeight: 600 }}>
                City
              </label>
              <input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="form-label" style={{ fontSize: 12.5, fontWeight: 600 }}>
                Postal Code
              </label>
              <input
                id="postalCode"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="ZIP / Postal"
                className="form-input"
              />
            </div>
          </div>

          {/* Tax ID Checkbox */}
          <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={taxIdProvided}
                onChange={(e) => setTaxIdProvided(e.target.checked)}
              />
              <span>I have a registered Tax ID / VAT Number / EIN for commercial invoicing</span>
            </label>

            {taxIdProvided && (
              <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                <select
                  value={taxIdType}
                  onChange={(e) => setTaxIdType(e.target.value as any)}
                  className="form-input"
                  style={{ width: 140 }}
                >
                  <option value="ein">US EIN / SSN</option>
                  <option value="vat">EU / UK VAT</option>
                  <option value="gst">GST / HST</option>
                  <option value="pan">PAN / GSTIN</option>
                  <option value="abn">Australian ABN</option>
                </select>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Tax ID is recorded on commercial invoices for accounting records.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Invoicing Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
