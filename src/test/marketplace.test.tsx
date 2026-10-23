import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ClientDataProvider } from '../context/ClientDataContext';
import { ExplorePage } from '../pages/ExplorePage';
import { EditorProfilePage } from '../pages/EditorProfilePage';
import { MarketplaceRequestsView } from '../components/dashboard/MarketplaceRequestsView';
import { EditorPortfolioManager } from '../components/dashboard/EditorPortfolioManager';
import { EditorProfileSettings } from '../components/dashboard/EditorProfileSettings';
import { AdminModerationView } from '../components/dashboard/AdminModerationView';

describe('Pixel Pedia — Freelancing Marketplace Comprehensive Workflows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('filters editors by discipline category and search query on explore page', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/explore']}>
              <ExplorePage />
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    // Initial render displays all demo editors
    await waitFor(() => {
      expect(screen.getByText(/Maya Chen/i)).toBeInTheDocument();
      expect(screen.getByText(/Jake Morrison/i)).toBeInTheDocument();
      expect(screen.getByText(/Sarah Kim/i)).toBeInTheDocument();
    });

    // Type search query
    const searchInput = screen.getByPlaceholderText(/search by name, style, or skills/i);
    fireEvent.change(searchInput, { target: { value: 'Maya' } });
    fireEvent.submit(searchInput.closest('form')!);

    // Should only show Maya Chen
    await waitFor(() => {
      expect(screen.getByText(/Maya Chen/i)).toBeInTheDocument();
      expect(screen.queryByText(/Jake Morrison/i)).not.toBeInTheDocument();
    });
  });

  it('renders editor public profile with rate card, portfolio reel, and tabs', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/editors/demo-editor-01']}>
              <Routes>
                <Route path="/editors/:id" element={<EditorProfilePage />} />
              </Routes>
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    // Check Editor Header Details
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Maya Chen/i })).toBeInTheDocument();
      expect(screen.getByText(/PRO VERIFIED/i)).toBeInTheDocument();
      expect(screen.getByText(/Available for Hire/i)).toBeInTheDocument();
      expect(screen.getByText(/\$500/i)).toBeInTheDocument();
    });

    // Check tabs
    expect(screen.getByRole('button', { name: /^portfolio/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /services & software/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /about & bio/i })).toBeInTheDocument();

    // Check portfolio items exist
    expect(screen.getByText(/Apex Horizon — Supercar Launch Film/i)).toBeInTheDocument();

    // Send Project Brief CTA
    expect(screen.getByRole('button', { name: /send project brief/i })).toBeInTheDocument();
  });

  it('renders the project requests view and displays pending and accepted tabs', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/dashboard/requests']}>
              <MarketplaceRequestsView />
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    // Check tabs
    expect(screen.getByRole('button', { name: /^all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^pending/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^accepted/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^completed/i })).toBeInTheDocument();
  });

  it('renders the editor portfolio manager with add work button', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/dashboard/portfolio']}>
              <EditorPortfolioManager />
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    expect(screen.getByRole('heading', { name: /portfolio manager/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add new work/i })).toBeInTheDocument();
  });

  it('renders editor profile settings with rate, headline, and availability fields', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/dashboard/profile']}>
              <EditorProfileSettings />
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    expect(screen.getByRole('heading', { name: /editor profile & rate settings/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/professional headline \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/starting project rate \(usd\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save profile changes/i })).toBeInTheDocument();
  });

  it('renders admin moderation view for reports review', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/dashboard/moderation']}>
              <AdminModerationView />
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    expect(screen.getByRole('heading', { name: /trust, safety & moderation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^pending/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^resolved/i })).toBeInTheDocument();
  });
});
