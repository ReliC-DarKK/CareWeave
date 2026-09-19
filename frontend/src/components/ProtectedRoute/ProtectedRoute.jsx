import React from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginPage from '../../pages/Login/LoginPage';

export default function ProtectedRoute({ children, theme, onToggleTheme }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--cw-bg-canvas)',
          color: 'var(--cw-text-secondary)',
          fontFamily: 'var(--cw-font)',
          fontSize: '14px',
        }}
      >
        <span>Verifying care session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage theme={theme} onToggleTheme={onToggleTheme} />;
  }

  return children;
}
