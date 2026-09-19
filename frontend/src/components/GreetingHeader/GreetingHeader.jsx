import React from 'react';
import { PatientAvatar } from '../Sidebar/Sidebar';
import './GreetingHeader.css';

export default function GreetingHeader({
  patientProfile,
  theme = 'light',
  onToggleTheme,
  onLogout,
  user,
}) {
  const preferredName = patientProfile?.preferredName || patientProfile?.name?.split(' ')[0] || 'Aditi';

  return (
    <header className="cw-header">
      <div className="cw-header-inner">
        {/* Left: 1.0 Authentic Greeting & Subtitle */}
        <div className="cw-header-greeting">
          <h1 className="cw-header-title">
            Good morning, {preferredName}
          </h1>
          <p className="cw-header-subtitle">
            Here's your current care state and what matters most today.
          </p>
        </div>

        {/* Right: Theme Toggle, Notifications, Logout, User Avatar */}
        <div className="cw-header-actions">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            className="cw-header-btn"
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

          {/* Notification Bell with red dot */}
          <button type="button" className="cw-header-btn cw-notification-wrap" aria-label="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="cw-notification-badge" aria-hidden="true" />
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              type="button"
              className="cw-header-btn cw-logout-btn"
              aria-label="Log out"
              title={`Log out (${user?.email || 'current user'})`}
              onClick={onLogout}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}

          {/* Aditi Sharma Avatar */}
          <div className="cw-header-avatar-wrap" aria-label="Patient Profile">
            <PatientAvatar />
          </div>
        </div>
      </div>
    </header>
  );
}
