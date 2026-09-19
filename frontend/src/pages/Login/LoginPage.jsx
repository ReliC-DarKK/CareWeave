import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginPage.css';

function CareWeaveLogo() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cw-login-logo-svg"
      aria-label="CareWeave Logo"
    >
      <defs>
        <linearGradient id="cwLoginHeartGrad" x1="4" y1="4" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4338CA" />
        </linearGradient>
        <filter id="cwLoginShadow" x="0" y="0" width="38" height="38" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#4338CA" floodOpacity="0.12" />
        </filter>
      </defs>
      <path
        d="M19 32.5C18.4 32.5 7.5 24 4.5 17C1.5 10 5.5 4.5 12 4.5C15.8 4.5 18 7.2 19 8.8C20 7.2 22.2 4.5 26 4.5C32.5 4.5 36.5 10 33.5 17C30.5 24 19.6 32.5 19 32.5Z"
        fill="url(#cwLoginHeartGrad)"
        filter="url(#cwLoginShadow)"
      />
      <path
        d="M19 12C16.8 9.5 14 7.8 12 7.8C8 7.8 6 11.5 8 16C10 20.5 16.5 25.5 19 27.5C21.5 25.5 28 20.5 30 16C32 11.5 30 7.8 26 7.8C24 7.8 21.2 9.5 19 12Z"
        fill="#FFFFFF"
        opacity="0.95"
      />
      <path
        d="M19 16.5C18.2 15.2 16.8 14 15.5 14C13.5 14 12.5 15.8 13.5 18C14.5 20.2 18 22.8 19 23.8C20 22.8 23.5 20.2 24.5 18C25.5 15.8 24.5 14 22.5 14C21.2 14 19.8 15.2 19 16.5Z"
        fill="url(#cwLoginHeartGrad)"
      />
      <circle cx="19" cy="18.5" r="1.5" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

export default function LoginPage({ onLoginSuccess, theme = 'light', onToggleTheme }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Field validation
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cw-login-page">
      {/* Top Header Bar with Theme Toggle */}
      <div className="cw-login-topbar">
        <button
          type="button"
          className="cw-login-theme-btn"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={onToggleTheme}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      <div className="cw-login-container">
        <div className="cw-login-card">
          {/* CareWeave Brand */}
          <div className="cw-login-brand">
            <div className="cw-login-logo-wrap">
              <CareWeaveLogo />
            </div>
            <div className="cw-login-brand-text">
              <h1 className="cw-login-brand-title">CareWeave</h1>
              <span className="cw-login-brand-tagline">One person. One care journey.</span>
            </div>
          </div>

          {/* Heading & Subtitle */}
          <div className="cw-login-heading-group">
            <h2 className="cw-login-heading">Welcome back</h2>
            <p className="cw-login-subtext">Sign in to access your care journey.</p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="cw-login-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="cw-login-form" onSubmit={handleSubmit} noValidate>
            <div className="cw-form-group">
              <label htmlFor="login-email" className="cw-form-label">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                className="cw-form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="cw-form-group">
              <label htmlFor="login-password" className="cw-form-label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="cw-form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="cw-login-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Log in'}
            </button>
          </form>

          {/* Prototype credentials hint */}
          <div className="cw-login-hint">
            <span>Development credentials:</span>
            <code>demo@example.com / careweave123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
