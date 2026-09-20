import React from 'react';
import GreetingHeader from '../../components/GreetingHeader/GreetingHeader';
import EmptyState from '../../components/EmptyState/EmptyState';
import '../Appointments/AppointmentsPage.css';

export default function CareTeamPage({
  patientProfile,
  theme,
  onToggleTheme,
  onLogout,
  user,
}) {
  return (
    <main className="cw-page-container cw-care-team-page" id="main-content">
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
              <path d="M16 21V19A4 4 0 0 0 12 15H6A4 4 0 0 0 2 19V21" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21V19A4 4 0 0 0 19 15.3" />
              <path d="M16 3.13A4 4 0 0 1 16 10.87" />
            </svg>
          }
          title="Care Team"
          description="No care team members recorded yet."
          subtext="Your care team information will appear here when available."
        />
      </div>
    </main>
  );
}
