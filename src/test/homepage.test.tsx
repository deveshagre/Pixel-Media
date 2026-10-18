import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ClientDataProvider } from '../context/ClientDataContext';
import { HomePage } from '../pages/HomePage';
import { EditorWorkspace } from '../components/editor/EditorWorkspace';

describe('Editorial Creative Studio Homepage & NLE Workspace', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the clean editorial homepage with wordmark, headline, and actions', () => {
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

    // Wordmark
    expect(screen.getAllByText(/PIXEL MEDIA/i)[0]).toBeInTheDocument();

    // Clean Horizontal Navigation Links
    expect(screen.getAllByRole('link', { name: /^Work$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Services$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^About$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Login$/i })[0]).toBeInTheDocument();

    // Required Headline and Lead
    expect(screen.getByRole('heading', { level: 1, name: /make every frame count/i })).toBeInTheDocument();
    expect(
      screen.getByText('Thoughtful editing, striking visuals, and motion that brings your ideas to life.', {
        selector: 'p',
      })
    ).toBeInTheDocument();

    // Primary & Secondary Actions
    expect(screen.getAllByRole('button', { name: /start a project/i })[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /explore our work/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export video/i })).toBeInTheDocument();

    // Interactive Composition Canvas & Timeline
    expect(screen.getByRole('img', { name: /interactive video preview composition canvas/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /interactive multitrack timeline/i })).toBeInTheDocument();
  });

  it('controls the featured media preview with play/pause and scene selection', async () => {
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

    // Play Reel button
    const playBtn = screen.getByRole('button', { name: /^Play Reel$/i });
    expect(playBtn).toBeInTheDocument();
    fireEvent.click(playBtn);

    // Switch to Pause Reel
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^Pause Reel$/i })).toBeInTheDocument();
    });

    // Scene pills (e.g. Beauty & Retouching)
    const beautyPill = screen.getByRole('button', { name: /beauty & retouching/i });
    fireEvent.click(beautyPill);
    expect(beautyPill).toHaveClass('active');
  });

  it('allows selecting the headline and editing text in the contextual toolbar', async () => {
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

    // Click on headline to select it
    const headline = screen.getByRole('heading', { level: 1, name: /make every frame count/i });
    fireEvent.click(headline);

    // Contextual toolbar should show text editor
    await waitFor(() => {
      expect(screen.getByRole('toolbar', { name: /text layer controls/i })).toBeInTheDocument();
    });

    const textInput = screen.getByPlaceholderText(/edit text content/i);
    fireEvent.change(textInput, { target: { value: 'Cinematic storytelling.' } });

    // Headline in hero updates immediately
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /cinematic storytelling/i })).toBeInTheDocument();
    });
  });

  it('manipulates the before-and-after comparison slider in the portfolio', () => {
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

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();

    // Keyboard arrow scrub on slider
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
  });

  it('renders all 6 editing services in a clean editorial layout', () => {
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

    expect(screen.getAllByText(/Video Editing & Post-Production/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/High-End Image Retouching/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Audio Production & Podcast Mastering/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Esports & Gaming Content/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Brand Identity & Graphic Design/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/3D Motion Graphics & Animation/i)[0]).toBeInTheDocument();
  });

  it('filters curated work by category and opens detailed project modal', async () => {
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

    // Filter by esports
    const esportsTab = screen.getByRole('tab', { name: /^Esports$/i });
    fireEvent.click(esportsTab);

    // Click on tournament card to open modal
    const vctCard = screen.getByRole('button', { name: /view details for vct champions 2025/i });
    fireEvent.click(vctCard);

    await waitFor(() => {
      expect(screen.getByText(/master deliverables/i)).toBeInTheDocument();
      expect(screen.getByText(/start a project like this/i)).toBeInTheDocument();
    });

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /close modal/i });
    fireEvent.click(closeBtn);
  });

  it('toggles reduced motion preference and sets data-reduced-motion on body', () => {
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

    const motionToggle = screen.getByRole('button', { name: /toggle reduced motion/i });
    fireEvent.click(motionToggle);

    expect(document.body.getAttribute('data-reduced-motion')).toBe('true');
  });

  it('submits a project inquiry and logs it to the client pipeline', async () => {
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

    // Fill the on-page inquiry form
    const titleInput = screen.getByPlaceholderText(/autumn commercial anthem/i);
    fireEvent.change(titleInput, { target: { value: 'Nike Commercial 60s Cut' } });

    const submitBtn = screen.getByRole('button', { name: /send inquiry/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/inquiry received/i)).toBeInTheDocument();
    });
  });

  it('renders the complete nonlinear editor route with panels and inspector', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/editor']}>
              <Routes>
                <Route path="/editor" element={<EditorWorkspace />} />
              </Routes>
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/PIXEL EDIT/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /media library/i })).toBeInTheDocument();
    expect(screen.getByText(/sequence settings/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /split at playhead/i })).toBeInTheDocument();
  });

  it('renders studio footages library and applies selected footage to the editor', async () => {
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

    // Footage tray is present
    expect(screen.getByRole('region', { name: /studio footage library/i })).toBeInTheDocument();
    expect(screen.getByText(/studio footages & b-roll/i)).toBeInTheDocument();

    // Tokyo Night Streets footage card
    const tokyoFootage = screen.getByText(/tokyo night streets/i);
    expect(tokyoFootage).toBeInTheDocument();

    // Click to apply footage to active layer
    fireEvent.click(tokyoFootage);

    // Headline updates with suggested footage headline
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /electric pulse of the city/i })).toBeInTheDocument();
    });
  });
});
