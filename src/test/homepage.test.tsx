import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ClientDataProvider } from '../context/ClientDataContext';
import { HomePage } from '../pages/HomePage';
import { ExplorePage } from '../pages/ExplorePage';
import { SignupPage } from '../pages/SignupPage';

// Route inspector helper to check current location and search query
const LocationInspector: React.FC = () => {
  const location = useLocation();
  return (
    <div data-testid="location-path">
      {location.pathname}
      {location.search}
    </div>
  );
};

describe('Pixel Media — Simplified Homepage & Interactive Role Selection', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('pixel_media_guest', 'true');
  });

  it('renders the simplified homepage with new headline, eyebrow, and two prominent role choices', () => {
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

    // 1. Brand Wordmark & Logo
    expect(screen.getAllByText(/Pixel Media/i)[0]).toBeInTheDocument();

    // 2. Eyebrow
    expect(screen.getByText(/YOUR NEXT CREATIVE PROJECT STARTS HERE/i)).toBeInTheDocument();

    // 3. Main Heading & Supporting Text
    expect(
      screen.getByRole('heading', { level: 1, name: /ideas deserve better visuals\./i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/find the right creative talent\. or turn your editing skills into your next opportunity\./i)
    ).toBeInTheDocument();

    // 4. Two Prominent Interactive Role Choices
    expect(screen.getByRole('heading', { level: 2, name: /i'm a client/i })).toBeInTheDocument();
    expect(screen.getByText(/i need a creative for my project\./i)).toBeInTheDocument();
    expect(screen.getByText(/hire talent/i)).toBeInTheDocument();

    expect(screen.getByRole('heading', { level: 2, name: /i'm an editor/i })).toBeInTheDocument();
    expect(screen.getByText(/i want to showcase my skills\./i)).toBeInTheDocument();
    expect(screen.getByText(/find work/i)).toBeInTheDocument();

    // 5. How It Works Section
    expect(screen.getByRole('heading', { level: 2, name: /direct, transparent creative collaboration/i })).toBeInTheDocument();
    expect(screen.getByText(/01 \/ DISCOVERY/i)).toBeInTheDocument();
    expect(screen.getByText(/02 \/ COLLABORATION/i)).toBeInTheDocument();
    expect(screen.getByText(/03 \/ DIRECT SETTLEMENT/i)).toBeInTheDocument();
  });

  it('routes unauthenticated visitors choosing "I\'m a Client" to signup with role=client', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/']}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/signup"
                  element={
                    <div>
                      <LocationInspector />
                      <SignupPage />
                    </div>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    const clientCard = screen.getByRole('link', {
      name: /i'm a client/i,
    });
    expect(clientCard).toBeInTheDocument();
    fireEvent.click(clientCard);

    await waitFor(() => {
      expect(screen.getByTestId('location-path')).toHaveTextContent('/signup?role=client');
    });
  });

  it('routes unauthenticated visitors choosing "I\'m an Editor" to signup with role=editor', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/']}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/signup"
                  element={
                    <div>
                      <LocationInspector />
                      <SignupPage />
                    </div>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    const editorCard = screen.getByRole('link', {
      name: /i'm an editor/i,
    });
    expect(editorCard).toBeInTheDocument();
    fireEvent.click(editorCard);

    await waitFor(() => {
      expect(screen.getByTestId('location-path')).toHaveTextContent('/signup?role=editor');
    });
  });

  it('routes authenticated client directly to explore without unnecessary auth', async () => {
    localStorage.removeItem('pixel_media_guest');
    localStorage.setItem(
      'pixel_media_auth_user',
      JSON.stringify({
        id: 'client-1',
        email: 'client@studio.com',
        fullName: 'Client Producer',
        role: 'client',
      })
    );

    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/']}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/explore"
                  element={
                    <div>
                      <LocationInspector />
                      <div>Explore Catalog</div>
                    </div>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    const clientCard = screen.getByRole('link', {
      name: /i'm a client/i,
    });
    expect(clientCard).toBeInTheDocument();
    fireEvent.click(clientCard);

    await waitFor(() => {
      expect(screen.getByTestId('location-path')).toHaveTextContent('/explore');
    });
  });

  it('routes authenticated editor directly to dashboard requests without unnecessary auth', async () => {
    localStorage.removeItem('pixel_media_guest');
    localStorage.setItem(
      'pixel_media_auth_user',
      JSON.stringify({
        id: 'editor-1',
        email: 'editor@creative.com',
        fullName: 'Lead Editor',
        role: 'editor',
      })
    );

    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/']}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/dashboard/requests"
                  element={
                    <div>
                      <LocationInspector />
                      <div>Editor Requests Workspace</div>
                    </div>
                  }
                />
              </Routes>
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    const editorCard = screen.getByRole('link', {
      name: /i'm an editor/i,
    });
    expect(editorCard).toBeInTheDocument();
    fireEvent.click(editorCard);

    await waitFor(() => {
      expect(screen.getByTestId('location-path')).toHaveTextContent('/dashboard/requests');
    });
  });

  it('preselects the correct role when navigating to signup with query parameters', () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/signup?role=editor']}>
            <SignupPage />
          </MemoryRouter>
        </AuthProvider>
      </LanguageProvider>
    );

    const editorBtn = screen.getByRole('button', { name: /work as editor/i });
    expect(editorBtn).toHaveClass('btn-primary');
  });

  it('opens portfolio detail modal when clicking a curated showcase card', async () => {
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

    // Curated showcase cards are rendered
    expect(screen.getByText(/Selected Editorial Works/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Apex Horizon/i)[0]).toBeInTheDocument();

    const showcaseCard = screen.getByRole('button', {
      name: /view work: apex horizon/i,
    });
    fireEvent.click(showcaseCard);

    // Lightbox modal opens with full item detail and close button
    await waitFor(() => {
      expect(screen.getByLabelText(/close dialog/i)).toBeInTheDocument();
      expect(
        screen.getByText(/full commercial edit for luxury automotive brand launch/i)
      ).toBeInTheDocument();
    });
  });

  it('renders the explore talent directory page properly', async () => {
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

    expect(
      screen.getByRole('heading', { level: 1, name: /find & hire video editors & creators/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/filter by software/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by experience level/i)).toBeInTheDocument();
  });
});
