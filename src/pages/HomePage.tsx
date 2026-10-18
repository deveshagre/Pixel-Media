import React, { useState, useEffect } from 'react';
import { HomeNavbar } from '../components/home/HomeNavbar';
import { HeroSection } from '../components/home/HeroSection';
import { PortfolioShowcase } from '../components/home/PortfolioShowcase';
import { ServiceExplorer } from '../components/home/ServiceExplorer';
import { StudioAbout } from '../components/home/StudioAbout';
import { StudioInquiry } from '../components/home/StudioInquiry';
import { HomeFooter } from '../components/home/HomeFooter';
import { HomeRequestModal } from '../components/home/HomeRequestModal';
import { ServiceCategory } from '../types';
import { EditorProvider } from '../editor/context/EditorContext';

export const HomePage: React.FC = () => {
  // Check for prefers-reduced-motion media query
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  const [requestModalOpen, setRequestModalOpen] = useState<boolean>(false);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<ServiceCategory>('video_editing');

  // Sync data-reduced-motion attribute on document body
  useEffect(() => {
    document.body.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false');
  }, [reducedMotion]);

  const handleStartProject = (category: ServiceCategory = 'video_editing') => {
    setSelectedServiceCategory(category);
    setRequestModalOpen(true);
  };

  const handleExploreWork = () => {
    const el = document.getElementById('work');
    if (el) {
      el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  return (
    <EditorProvider>
      <div className="studio-home">
      {/* Horizontal Studio Navigation */}
      <HomeNavbar
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion((prev) => !prev)}
        onStartProject={() => handleStartProject('video_editing')}
      />

      {/* Hero Section */}
      <HeroSection
        onStartProject={() => handleStartProject('video_editing')}
        onExploreWork={handleExploreWork}
      />

      {/* Curated Portfolio Grid & Before/After Comparison */}
      <PortfolioShowcase
        onStartSimilarProject={(cat) => handleStartProject(cat)}
      />

      {/* Six Editing Services */}
      <ServiceExplorer
        onStartServiceProject={(cat) => handleStartProject(cat)}
      />

      {/* Concise Studio Introduction */}
      <StudioAbout />

      {/* Project Inquiry Section */}
      <StudioInquiry selectedCategory={selectedServiceCategory} />

      {/* Simple Studio Footer */}
      <HomeFooter />

      {/* Direct Project Request Modal */}
      <HomeRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        defaultCategory={selectedServiceCategory}
      />
    </div>
  </EditorProvider>
  );
};

export default HomePage;
