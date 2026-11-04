import React, { useState } from 'react';
import {
  FileText,
  Eye,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBilling } from '../../hooks/useBilling';
import { ProjectInvoice, formatMinorUnits } from '../../types/billing';
import { InvoiceViewModal } from './InvoiceViewModal';

export const InvoicesListView: React.FC = () => {
  const { user } = useAuth();
  const { invoices, loading } = useBilling();

  const [activeFilter, setActiveFilter] = useState<'all' | 'issued' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<ProjectInvoice | null>(null);

  const isEditor = user?.role === 'editor';
  const isClient = user?.role === 'client';

  // Filter invoices based on status and search query
  const filteredInvoices = invoices.filter((inv) => {
    // Status filter
    if (activeFilter === 'issued' && inv.status === 'paid') return false;
    if (activeFilter === 'paid' && inv.status !== 'paid') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
      const matchTitle = inv.projectTitle.toLowerCase().includes(q);
      const matchCounterparty = isEditor
        ? inv.clientName.toLowerCase().includes(q)
        : inv.editorName.toLowerCase().includes(q);
      return matchNum || matchTitle || matchCounterparty;
    }

    return true;
  });

  // Calculate high-level scope stats
  const totalInvoicedMinor = invoices.reduce((acc, curr) => acc + curr.totalMinor, 0);
  const totalMilestones = invoices.reduce((acc, curr) => acc + curr.milestones.length, 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <h2 className="text-title-1" style={{ marginBottom: 4 }}>
            Invoices & Commercial Quotes
          </h2>
          <p className="text-body">
            {isEditor
              ? 'View accepted project quotes, agreed deliverables, and commercial milestone records.'
              : 'Review project quotations, agreed deliverables, and scope records for your accounts.'}
          </p>
        </div>
      </div>

      {/* Direct Payment Notice */}
      <div
        style={{
          padding: '12px 18px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 10,
          border: '1px solid var(--border-subtle)',
          marginBottom: 20,
          fontSize: 12.5,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Direct Payment Model:</span>
        <span>
          Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments.
        </span>
      </div>

      {/* Financial & Scope Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="text-caption">Total Contracted Scope</span>
            <FileText size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            {formatMinorUnits(totalInvoicedMinor, 'USD')}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Across {invoices.length} project contracts
          </div>
        </div>

        <div style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="text-caption">Milestone Deliverables</span>
            <CheckCircle2 size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
            {totalMilestones}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Scheduled project deliverables
          </div>
        </div>

        <div style={{ padding: '20px 22px', background: 'var(--bg-surface)', borderRadius: 14, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="text-caption">Record Status</span>
            <Clock size={18} color="#60a5fa" />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#60a5fa', marginTop: 4 }}>
            Direct Records
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            For parties' own accounting records
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
        <div className="filter-tabs">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          >
            All Quotes & Invoices ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('issued')}
            className={`filter-tab ${activeFilter === 'issued' ? 'active' : ''}`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('paid')}
            className={`filter-tab ${activeFilter === 'paid' ? 'active' : ''}`}
          >
            Completed
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: 260 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search invoice #, project..."
            className="form-input"
            style={{ paddingLeft: 34, fontSize: 13 }}
          />
        </div>
      </div>

      {/* Invoices List / Table */}
      {loading ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading commercial invoices...
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            borderRadius: 14,
            border: '1px solid var(--border-subtle)',
          }}
        >
          <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            No Invoices Found
          </h4>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
            {searchQuery
              ? 'No invoices match your current search query.'
              : 'When proposals are accepted, formal invoices with milestone tracking will appear here.'}
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 14, overflow: 'hidden', background: 'var(--bg-surface)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Invoice #</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Project Title</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {isEditor ? 'Client' : 'Creator'}
                </th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Total</th>
                <th style={{ padding: '14px 18px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 18px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {inv.invoiceNumber}
                    {inv.isDemo && (
                      <span
                        style={{
                          marginLeft: 6,
                          fontSize: 10,
                          padding: '1px 5px',
                          borderRadius: 3,
                          background: 'rgba(251, 191, 36, 0.15)',
                          color: '#fbbf24',
                        }}
                      >
                        DEMO
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-primary)', fontWeight: 500 }}>
                    {inv.projectTitle}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {inv.milestones.length} milestone{inv.milestones.length > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                    {isEditor ? inv.clientName : inv.editorName}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 8px',
                        borderRadius: 4,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        background:
                          inv.status === 'paid'
                            ? 'rgba(52, 211, 153, 0.12)'
                            : 'rgba(96, 165, 250, 0.12)',
                        color:
                          inv.status === 'paid'
                            ? '#34d399'
                            : '#60a5fa',
                      }}
                    >
                      {inv.status === 'paid'
                        ? 'Completed'
                        : 'Active Scope'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {formatMinorUnits(inv.totalMinor, inv.currency)}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(inv)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}
                    >
                      <Eye size={13} />
                      <span>View Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Invoice Preview Modal */}
      {selectedInvoice && (
        <InvoiceViewModal
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          invoice={selectedInvoice}
          isClient={isClient}
        />
      )}
    </div>
  );
};
