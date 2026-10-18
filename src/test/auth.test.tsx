import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LanguageProvider } from '../i18n/LanguageContext';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';

const TestAuthConsumer: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{user ? `logged-in:${user.email}` : 'logged-out'}</span>
      {user && <button onClick={() => logout()}>Logout</button>}
    </div>
  );
};

describe('Authentication Flow & Security Validation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates password length on signup', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/signup']}>
            <Routes>
              <Route path="/signup" element={<SignupPage />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </LanguageProvider>
    );

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/work email/i);
    const passwordInput = screen.getByLabelText(/password \*/i);
    const submitBtn = screen.getByRole('button', { name: /create client account/i });

    fireEvent.change(nameInput, { target: { value: 'Alex Morgan' } });
    fireEvent.change(emailInput, { target: { value: 'alex@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } }); // too short

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/minimum 6 characters/i)).toBeInTheDocument();
    });
  });

  it('allows client to log in and persists session', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard/overview" element={<TestAuthConsumer />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </LanguageProvider>
    );

    const emailInput = screen.getByLabelText(/work email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginBtn = screen.getByRole('button', { name: /sign in to portal/i });

    fireEvent.change(emailInput, { target: { value: 'alex@production.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepassword123' } });
    fireEvent.click(loginBtn);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-in:alex@production.com');
    });
  });

  it('allows client to log out and clears session state', async () => {
    render(
      <LanguageProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/dashboard/overview']}>
            <Routes>
              <Route path="/dashboard/overview" element={<TestAuthConsumer />} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/logout/i));

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
    });
  });
});
