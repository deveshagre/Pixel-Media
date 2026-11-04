import React from 'react';
import {
  X,
  Printer,
  FileText,
  Info,
} from 'lucide-react';
import {
  ProjectInvoice,
  formatMinorUnits,
} from '../../types/billing';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: ProjectInvoice;
  currentUserId?: string;
  isClient?: boolean;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="invoice-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        backgroundColor: 'rgba(9, 9, 11, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
    >
      <div
        className="printable-invoice"
        style={{
          width: '100%',
          maxWidth: 820,
          background: 'var(--bg-surface)',
          borderRadius: 16,
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Modal Bar (hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface-elevated)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={16} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {invoice.invoiceNumber}
            </span>
            <span
              style={{
                fontSize: 10.5,
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              RECORD ONLY (NOT PROOF OF PAYMENT)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: 6 }}
              aria-label="Close invoice preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>PIXEL MEDIA</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Commercial Project Scope & Invoicing Record
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {invoice.invoiceNumber}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Date: {new Date(invoice.issuedAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
              {invoice.dueDate && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Agreed Delivery Target: {invoice.dueDate}
                </div>
              )}
            </div>
          </div>

          {/* Parties Breakdown (Bill From / Bill To) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            <div style={{ padding: '16px 20px', background: 'var(--bg-surface-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                CREATOR / SERVICE PROVIDER
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {invoice.editorBusinessName || invoice.editorName}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                Lead Creator: {invoice.editorName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Independent Contractor
              </div>
            </div>

            <div style={{ padding: '16px 20px', background: 'var(--bg-surface-elevated)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>
                CLIENT / RECIPIENT
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                {invoice.clientName}
              </div>
              {invoice.clientEmail && (
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {invoice.clientEmail}
                </div>
              )}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Commissioning Client
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>
              COMMISSIONED WORK / PROJECT TITLE
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
              {invoice.projectTitle}
            </div>
          </div>

          {/* Milestones Schedule Table */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 12 }}>
              Agreed Deliverables & Milestone Schedule
            </div>
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontSize: 11.5, textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Milestone Scope</th>
                    <th style={{ padding: '12px 16px' }}>Due Condition</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Agreed Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.milestones.map((m) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                          {m.title}
                        </div>
                        {m.description && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {m.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', fontSize: 12.5 }}>
                        {m.dueCondition || 'Upon client review acceptance'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        {formatMinorUnits(m.amountMinor, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Accounting Totals Block */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Agreed Net Deliverables:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatMinorUnits(invoice.subtotalMinor, invoice.currency)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Platform Facilitation (5%):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatMinorUnits(invoice.platformFeeMinor, invoice.currency)}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Estimated Tax:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatMinorUnits(invoice.taxMinor, invoice.currency)}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 10,
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: 16,
                  fontWeight: 800,
                }}
              >
                <span style={{ color: 'var(--text-primary)' }}>Total Agreed Contract:</span>
                <span style={{ color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                  {formatMinorUnits(invoice.totalMinor, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Required Direct Payment Note & Legal Status Disclaimer */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 10,
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              fontSize: 12.5,
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-primary)', fontWeight: 600 }}>
              <Info size={16} color="var(--primary)" />
              <span>Direct Settlement Policy</span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments.
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11.5, borderTop: '1px solid var(--border-subtle)', paddingTop: 8, marginTop: 4 }}>
              <strong>Notice:</strong> This document is for the parties' own records and is not proof of payment. Commercial creative production services are contracted directly between the client and independent creator.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
