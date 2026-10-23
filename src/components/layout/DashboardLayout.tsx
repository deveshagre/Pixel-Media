import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ServiceRequestModal } from '../dashboard/ServiceRequestModal';
import { ToastContainer, ToastMessage } from '../common/Toast';
import { useLanguage } from '../../i18n/LanguageContext';
import { ServiceCategory } from '../../types';

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestCategory, setRequestCategory] = useState<ServiceCategory>('video_editing');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const { t } = useLanguage();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/requests')) return 'Project Requests & Briefs';
    if (path.includes('/dashboard/portfolio')) return 'Portfolio Showcase';
    if (path.includes('/dashboard/profile')) return 'Editor Profile & Rates';
    if (path.includes('/dashboard/moderation')) return 'Moderation & Safety Queue';
    if (path.includes('/dashboard/services')) return t.nav.services;
    if (path.includes('/dashboard/help')) return t.nav.help;
    return t.nav.overview;
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}`,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== newToast.id));
    }, 4500);
  };

  const handleOpenRequestModal = (category?: ServiceCategory) => {
    if (category) {
      setRequestCategory(category);
    }
    setIsRequestModalOpen(true);
  };

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="app-main">
        <Topbar
          onOpenMobile={() => setMobileOpen(true)}
          onRequestService={() => handleOpenRequestModal()}
          title={getPageTitle()}
        />

        <main className="app-content">
          <Outlet context={{ openRequestModal: handleOpenRequestModal, showToast }} />
        </main>
      </div>

      <ServiceRequestModal
        key={requestCategory}
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialCategory={requestCategory}
        onSuccess={(msg) => showToast(msg, 'success')}
      />

      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
};
