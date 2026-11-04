import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  decimalToMinorUnits,
  minorUnitsToDecimal,
  formatMinorUnits,
  calculatePlatformFee,
  calculateInvoiceAccounting,
  ProjectInvoice,
} from '../types/billing';
import { InvoiceViewModal } from '../components/billing/InvoiceViewModal';
import { InvoicesListView } from '../components/billing/InvoicesListView';
import { AuthProvider } from '../context/AuthContext';

describe('Project Invoicing & Minor-Unit Milestone Accounting', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('converts decimal dollar amounts to integer minor units without floating-point errors', () => {
    expect(decimalToMinorUnits(1400.0)).toBe(140000);
    expect(decimalToMinorUnits(250.55)).toBe(25055);
    expect(decimalToMinorUnits(0.01)).toBe(1);
    expect(decimalToMinorUnits(0)).toBe(0);
    expect(decimalToMinorUnits(NaN)).toBe(0);

    // Verify reverse conversion
    expect(minorUnitsToDecimal(140000)).toBe(1400);
    expect(minorUnitsToDecimal(25055)).toBe(250.55);
  });

  it('formats minor units accurately with currency symbols and ISO codes', () => {
    expect(formatMinorUnits(140000, 'USD')).toBe('$1,400.00 USD');
    expect(formatMinorUnits(73550, 'USD')).toBe('$735.50 USD');
    expect(formatMinorUnits(50000, 'EUR')).toBe('€500.00 EUR');
    expect(formatMinorUnits(120000, 'GBP')).toBe('£1,200.00 GBP');
  });

  it('calculates 5% platform facilitation fee in integer minor units', () => {
    // $1,000 subtotal (100,000 cents) -> 5% = 5,000 cents ($50)
    expect(calculatePlatformFee(100000, 0.05)).toBe(5000);

    // Odd cent amounts: $125.75 (12575 cents) -> 5% = 628.75 -> rounded to 629 cents ($6.29)
    expect(calculatePlatformFee(12575, 0.05)).toBe(629);
  });

  it('calculates authoritative invoice accounting totals where total = subtotal + fee + tax', () => {
    const milestonesMinor = [70000, 70000]; // 2 milestones of $700.00 each
    const result = calculateInvoiceAccounting(milestonesMinor, 0.05, 0);

    expect(result.subtotalMinor).toBe(140000); // $1,400.00
    expect(result.platformFeeMinor).toBe(7000); // $70.00 (5%)
    expect(result.taxMinor).toBe(0);
    expect(result.totalMinor).toBe(147000); // $1,470.00
    expect(result.totalMinor).toBe(result.subtotalMinor + result.platformFeeMinor + result.taxMinor);
  });

  it('renders commercial invoice detail modal with agreed milestones and print option', () => {
    const mockInvoice: ProjectInvoice = {
      id: 'inv-test-1',
      invoiceNumber: 'INV-2026-9999',
      requestId: 'req-test-1',
      proposalId: 'prop-test-1',
      projectTitle: 'Commercial Cinema Spot',
      clientId: 'client-1',
      clientName: 'Acme Media Corp',
      editorId: 'editor-1',
      editorName: 'Sarah Jenkins',
      currency: 'USD',
      subtotalMinor: 100000,
      platformFeeMinor: 5000,
      platformFeeRate: 0.05,
      taxMinor: 0,
      taxRate: 0,
      totalMinor: 105000,
      amountPaidMinor: 0,
      amountReleasedMinor: 0,
      status: 'issued',
      milestones: [
        {
          id: 'ms-1',
          title: 'V1 Rough Cut Assembly',
          description: 'Initial assembly cut with synchronized stems.',
          amountMinor: 50000,
          status: 'pending',
          dueCondition: 'First cut delivery',
        },
        {
          id: 'ms-2',
          title: 'Color Grade & Audio Mix',
          description: '4K ProRes final conform.',
          amountMinor: 50000,
          status: 'pending',
          dueCondition: 'Final sign-off',
        },
      ],
      issuedAt: new Date().toISOString(),
      dueDate: '2026-11-15',
      taxComplianceNote: 'Platform facilitation terms apply.',
      isDemo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(
      <InvoiceViewModal
        isOpen={true}
        onClose={() => {}}
        invoice={mockInvoice}
        isClient={true}
      />
    );

    // Verify header and invoice number
    expect(screen.getAllByText('INV-2026-9999').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Commercial Cinema Spot/i)).toBeInTheDocument();
    expect(screen.getByText('Acme Media Corp')).toBeInTheDocument();
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();

    // Verify milestones rendered
    expect(screen.getByText('V1 Rough Cut Assembly')).toBeInTheDocument();
    expect(screen.getByText('Color Grade & Audio Mix')).toBeInTheDocument();

    // Verify financial amounts
    expect(screen.getAllByText('$1,050.00 USD').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('$50.00 USD')).toBeInTheDocument(); // Fee

    // Verify print button
    expect(screen.getByRole('button', { name: /Print \/ PDF/i })).toBeInTheDocument();

    // Verify record-only label and exact direct payment notice
    expect(screen.getByText(/RECORD ONLY \(NOT PROOF OF PAYMENT\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments./i)).toBeInTheDocument();
    expect(screen.getByText(/This document is for the parties' own records and is not proof of payment./i)).toBeInTheDocument();

    // Verify NO payment/funding/release buttons exist
    expect(screen.queryByRole('button', { name: /pay/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /fund/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /release/i })).not.toBeInTheDocument();
  });

  it('renders invoices list ledger with filter tabs and direct payment notice', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <InvoicesListView />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Invoices & Commercial Quotes/i)).toBeInTheDocument();
    expect(screen.getByText(/Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments./i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /All Quotes & Invoices/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Active/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Completed/i })).toBeInTheDocument();
  });
});
