import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ClientDataProvider } from '../context/ClientDataContext';
import { HomePage } from '../pages/HomePage';
import { ExplorePage } from '../pages/ExplorePage';

describe('Pixel Pedia — Freelancing Marketplace Homepage & Discovery', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the marketplace homepage with branding, headline, and search box', () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/']}>
              <HomePage />
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    // Marketplace Brand
    expect(screen.getAllByText(/Pixel Pedia/i)[0]).toBeInTheDocument();

    // Primary Navigation
    expect(screen.getAllByRole('link', { name: /find editors/i })[0]).toBeInTheDocument();

    // Hero Headline
    expect(
      screen.getByRole('heading', { level: 1, name: /find & hire world-class/i })
    ).toBeInTheDocument();

    // Search Box
    const searchInput = screen.getByPlaceholderText(/try 'youtube documentary editor'/i);
    expect(searchInput).toBeInTheDocument();

    // Featured categories pills
    expect(screen.getByText(/Commercial & Narrative/i)).toBeInTheDocument();
    expect(screen.getByText(/3D Motion Graphics/i)).toBeInTheDocument();
    expect(screen.getByText(/DaVinci Color Grading/i)).toBeInTheDocument();

    // Trust indicators
    expect(screen.getByText(/100% Vetted Portfolios/i)).toBeInTheDocument();
    expect(screen.getByText(/24-48h Brief Responses/i)).toBeInTheDocument();
  });

  it('renders featured editors and opens the structured project brief hire modal', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/']}>
              <HomePage />
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    // Featured editors are present
    expect(screen.getByText(/Maya Chen/i)).toBeInTheDocument();
    expect(screen.getByText(/Jake Morrison/i)).toBeInTheDocument();

    // Click "Hire" button on the first editor
    const hireButtons = screen.getAllByRole('button', { name: /^hire$/i });
    expect(hireButtons.length).toBeGreaterThan(0);
    fireEvent.click(hireButtons[0]);

    // Hire Brief Modal opens
    await waitFor(() => {
      expect(screen.getByText(/send a structured brief and request a milestone quote/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/project title \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/project brief & creative direction \*/i)).toBeInTheDocument();
    });
  });

  it('toggles "How It Works" between Clients and Editors', () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/']}>
              <HomePage />
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    // Initial state: For Clients
    expect(screen.getByText(/Dispatch Structured Brief/i)).toBeInTheDocument();

    // Switch to Editors view
    const forEditorsBtn = screen.getByRole('button', { name: /for editors & creators/i });
    fireEvent.click(forEditorsBtn);

    // Should now show editor workflow
    expect(screen.getByText(/Build Your Showcase/i)).toBeInTheDocument();
    expect(screen.getByText(/Receive Structured Inquiries/i)).toBeInTheDocument();
  });

  it('renders the explore page with discipline filter chips and software selector', async () => {
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

    // Page Heading
    expect(
      screen.getByRole('heading', { level: 1, name: /find & hire video editors & creators/i })
    ).toBeInTheDocument();

    // Software & discipline filters
    expect(screen.getByLabelText(/filter by software/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by experience level/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all disciplines/i })).toBeInTheDocument();

    // Editor cards loaded
    await waitFor(() => {
      expect(screen.getByText(/Maya Chen/i)).toBeInTheDocument();
    });
  });
});
