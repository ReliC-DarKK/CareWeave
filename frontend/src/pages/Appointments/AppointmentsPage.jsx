import React from 'react';
import GreetingHeader from '../../components/GreetingHeader/GreetingHeader';
import EmptyState from '../../components/EmptyState/EmptyState';
import './AppointmentsPage.css';

export default function AppointmentsPage({
  patientProfile,
  theme,
  onToggleTheme,
  onLogout,
  user,
}) {
  return (
    <main className="cw-page-container cw-appointments-page" id="main-content">
      <GreetingHeader
        patientProfile={patientProfile}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        user={user}
      />

      <div className="cw-page-content-wrapper">
        <EmptyState
          icon={
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          title="Appointments"
          description="No appointments recorded yet."
          subtext="Your appointment information will appear here when available."
        />
      </div>
    </main>
  );
}
