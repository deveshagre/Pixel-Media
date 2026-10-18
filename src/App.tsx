import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ClientDataProvider } from './context/ClientDataContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewSection } from './components/dashboard/OverviewSection';
import { PortfolioSection } from './components/portfolio/PortfolioSection';
import { ServicesSection } from './components/services/ServicesSection';
import { HelpCenterSection } from './components/help/HelpCenterSection';
import { EditorPlaceholder } from './components/editor/EditorPlaceholder';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ClientDataProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Client Dashboard Routes */}
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
                <Route path="portfolio" element={<PortfolioSection />} />
                <Route path="services" element={<ServicesSection />} />
                <Route path="help" element={<HelpCenterSection />} />
              </Route>

              {/* Protected Editor Placeholder Route (Phase 2) */}
              <Route
                path="/editor"
                element={
                  <ProtectedRoute>
                    <EditorPlaceholder />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard/overview" replace />} />
            </Routes>
          </BrowserRouter>
        </ClientDataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
