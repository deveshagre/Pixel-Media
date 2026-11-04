import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CreatorPayoutSettings } from '../components/billing/CreatorPayoutSettings';
import { AuthProvider } from '../context/AuthContext';

describe('Creator Business Onboarding & Payout Readiness', () => {
  beforeEach(() => {
    localStorage.clear();
    const mockEditor = {
      id: 'mock-editor-1',
      email: 'elena@rostovacinema.com',
      fullName: 'Elena Rostova',
      role: 'editor',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('pixel_media_auth_user', JSON.stringify(mockEditor));
  });

  it('renders business onboarding form with required commercial fields', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CreatorPayoutSettings />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByText(/Creator Business & Payout Readiness/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Legal Name \/ Registered Business \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Entity Classification \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country of Tax Residence \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Official Invoicing Email \*/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save Invoicing Settings/i })).toBeInTheDocument();
  });

  it('does NOT collect sensitive banking routing numbers or raw identity documents directly', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CreatorPayoutSettings />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify there are no form fields asking for bank account or routing numbers
    expect(screen.queryByLabelText(/routing number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/bank account number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/social security number/i)).not.toBeInTheDocument();

    // Verify direct payment architecture notice is displayed
    expect(screen.getByText(/Secure Direct Payment Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/Direct Settlement Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments./i)).toBeInTheDocument();
  });

  it('updates commercial business information when form is submitted', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CreatorPayoutSettings />
        </AuthProvider>
      </BrowserRouter>
    );

    const legalNameInput = screen.getByLabelText(/Legal Name \/ Registered Business \*/i);
    fireEvent.change(legalNameInput, { target: { value: 'Apex Visuals Studio Inc' } });

    const submitBtn = screen.getByRole('button', { name: /Save Invoicing Settings/i });
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Business profile saved successfully/i)).toBeInTheDocument();
    });

    // Check stored payout profile
    const stored = JSON.parse(localStorage.getItem('pixel_media_creator_payouts') || '{}');
    expect(stored['mock-editor-1'].legalName).toBe('Apex Visuals Studio Inc');
  });

  it('confirms direct settlement terms without Stripe Connect button or escrow claims', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CreatorPayoutSettings />
        </AuthProvider>
      </BrowserRouter>
    );

    // Verify Stripe Connect button is NOT present
    expect(screen.queryByRole('button', { name: /Connect Stripe/i })).not.toBeInTheDocument();

    // Verify Direct Settlement badge is displayed
    expect(screen.getByText('DIRECT SETTLEMENT')).toBeInTheDocument();
    expect(screen.getByText(/Direct Settlement Ready/i)).toBeInTheDocument();
  });
});
