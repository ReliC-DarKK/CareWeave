import React from 'react';
import GreetingHeader from '../../components/GreetingHeader/GreetingHeader';
import EmptyState from '../../components/EmptyState/EmptyState';
import '../Appointments/AppointmentsPage.css';

export default function MessagesPage({
  patientProfile,
  theme,
  onToggleTheme,
  onLogout,
  user,
}) {
  return (
    <main className="cw-page-container cw-messages-page" id="main-content">
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
              <path d="M21 12A9 9 0 0 1 9 20.9L3 21L4.8 15.6A9 9 0 1 1 21 12Z" />
              <circle cx="9" cy="12" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="15" cy="12" r="1" fill="currentColor" />
            </svg>
          }
          title="Messages"
          description="No messages recorded yet."
          subtext="Your messages and communications will appear here when available."
        />
      </div>
    </main>
  );
}
