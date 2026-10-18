import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '../i18n/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { ClientDataProvider } from '../context/ClientDataContext';
import { ServicesSection } from '../components/services/ServicesSection';
import { HelpCenterSection } from '../components/help/HelpCenterSection';
import { EditorPlaceholder } from '../components/editor/EditorPlaceholder';
import { DashboardLayout } from '../components/layout/DashboardLayout';

describe('Client Dashboard Features & Components', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders all 6 creative editing service categories', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/dashboard/services']}>
              <Routes>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard/services" element={<ServicesSection />} />
                </Route>
              </Routes>
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    expect(screen.getByText(/video editing/i)).toBeInTheDocument();
    expect(screen.getByText(/image retouching/i)).toBeInTheDocument();
    expect(screen.getByText(/audio production/i)).toBeInTheDocument();
    expect(screen.getByText(/esports & gaming/i)).toBeInTheDocument();
    expect(screen.getByText(/graphic design/i)).toBeInTheDocument();
    expect(screen.getByText(/motion graphics/i)).toBeInTheDocument();
  });

  it('allows client to submit a support ticket in Help Center', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <ClientDataProvider>
            <MemoryRouter initialEntries={['/dashboard/help']}>
              <Routes>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard/help" element={<HelpCenterSection />} />
                </Route>
              </Routes>
            </MemoryRouter>
          </ClientDataProvider>
        </AuthProvider>
      </LanguageProvider>
    );

    // Switch to direct contact tab
    const contactTab = screen.getByRole('button', { name: /direct support inquiry/i });
    fireEvent.click(contactTab);

    // Fill form
    const subjectInput = screen.getByPlaceholderText(/stem export questions/i);
    const messageInput = screen.getByPlaceholderText(/describe your inquiry/i);
    const submitBtn = screen.getByRole('button', { name: /submit inquiry/i });

    fireEvent.change(subjectInput, { target: { value: 'Color grade revision for scene 3' } });
    fireEvent.change(messageInput, { target: { value: 'Please adjust shadows and contrast in the rooftop sequence.' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/color grade revision for scene 3/i)).toBeInTheDocument();
    });
  });

  it('displays the Phase 2 Editor placeholder cleanly', () => {
    render(
      <LanguageProvider>
        <MemoryRouter>
          <EditorPlaceholder />
        </MemoryRouter>
      </LanguageProvider>
    );

    expect(screen.getByText(/pixel studio web suite/i)).toBeInTheDocument();
    expect(screen.getByText(/phase 2 architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/multi-track timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/return to client dashboard/i)).toBeInTheDocument();
  });
});
