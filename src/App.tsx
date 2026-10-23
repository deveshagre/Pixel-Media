import React, { useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ClientDataProvider } from './context/ClientDataContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewSection } from './components/dashboard/OverviewSection';
import { MarketplaceRequestsView } from './components/dashboard/MarketplaceRequestsView';
import { EditorPortfolioManager } from './components/dashboard/EditorPortfolioManager';
import { EditorProfileSettings } from './components/dashboard/EditorProfileSettings';
import { AdminModerationView } from './components/dashboard/AdminModerationView';
import { ServicesSection } from './components/services/ServicesSection';
import { HelpCenterSection } from './components/help/HelpCenterSection';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { EditorProfilePage } from './pages/EditorProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { CinematicIntro, useCinematicIntro } from './components/cinematic/CinematicIntro';

export const App: React.FC = () => {
  const { showIntro, handleComplete } = useCinematicIntro();

  // ESC key handler for skipping the intro
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showIntro) {
        // Find and click the skip button to trigger the skip flow
        const skipBtn = document.querySelector<HTMLButtonElement>('[data-testid="skip-intro-btn"]');
        skipBtn?.click();
      }
    },
    [showIntro]
  );

  useEffect(() => {
    if (showIntro) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showIntro, handleKeyDown]);

  return (
    <LanguageProvider>
      <AuthProvider>
        <ClientDataProvider>
          {/* Cinematic studio-logo intro overlay */}
          {showIntro && <CinematicIntro onComplete={handleComplete} />}

          <BrowserRouter>
            <Routes>
              {/* Public Marketplace Landing */}
              <Route path="/" element={<HomePage />} />

              {/* Public Marketplace Discovery / Search */}
              <Route path="/explore" element={<ExplorePage />} />

              {/* Public Editor Profile & Portfolio */}
              <Route path="/editors/:id" element={<EditorProfilePage />} />

              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Role-Based Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard/overview" replace />} />
                <Route path="overview" element={<OverviewSection />} />
                <Route path="requests" element={<MarketplaceRequestsView />} />
                <Route path="portfolio" element={<EditorPortfolioManager />} />
                <Route path="profile" element={<EditorProfileSettings />} />
                <Route path="moderation" element={<AdminModerationView />} />
                <Route path="services" element={<ServicesSection />} />
                <Route path="help" element={<HelpCenterSection />} />
              </Route>

              {/* Legacy timeline editor redirect -> marketplace talent directory */}
              <Route path="/editor" element={<Navigate to="/explore" replace />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ClientDataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
