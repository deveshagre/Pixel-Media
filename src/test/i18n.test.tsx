import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';

const LanguageTestComponent: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <h1 data-testid="portal-title">{t.nav.clientPortal}</h1>
      <span data-testid="services-nav">{t.nav.services}</span>
      <button onClick={() => setLanguage('hi')}>Switch to Hindi</button>
      <button onClick={() => setLanguage('de')}>Switch to German</button>
      <button onClick={() => setLanguage('fr')}>Switch to French</button>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
    </div>
  );
};

describe('Multi-Language Translation System (i18n)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders English by default and switches to Hindi, German, and French', () => {
    render(
      <LanguageProvider>
        <LanguageTestComponent />
      </LanguageProvider>
    );

    // Initial English
    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('portal-title')).toHaveTextContent('Pixel Media');
    expect(screen.getByTestId('services-nav')).toHaveTextContent('Editing Services');

    // Switch to Hindi
    fireEvent.click(screen.getByText('Switch to Hindi'));
    expect(screen.getByTestId('current-lang')).toHaveTextContent('hi');
    expect(screen.getByTestId('portal-title')).toHaveTextContent('पिक्सेल मीडिया');
    expect(screen.getByTestId('services-nav')).toHaveTextContent('संपादन सेवाएं');

    // Switch to German
    fireEvent.click(screen.getByText('Switch to German'));
    expect(screen.getByTestId('current-lang')).toHaveTextContent('de');
    expect(screen.getByTestId('services-nav')).toHaveTextContent('Kreativ-Dienste');

    // Switch to French
    fireEvent.click(screen.getByText('Switch to French'));
    expect(screen.getByTestId('current-lang')).toHaveTextContent('fr');
    expect(screen.getByTestId('services-nav')).toHaveTextContent('Services de Montage');
  });
});
