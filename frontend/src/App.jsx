import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login/LoginPage';
import Sidebar from './components/Sidebar/Sidebar';
import HomePage from './pages/Home/HomePage';
import {
  patientProfile,
  navigationItems,
  addDocumentData,
  careAtGlanceData,
} from './data/homePlaceholderData';
import './App.css';

function AppContent({ theme, onToggleTheme }) {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  };

  // While restoring session from storage/verifying with backend
  if (isLoading) {
    return (
      <div className="cw-loading-screen" data-theme={theme}>
        <div className="cw-loading-indicator">
          <span>Verifying care session...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated: guard Home and force Login
  if (!isAuthenticated) {
    if (currentPath !== '/' && currentPath !== '/login') {
      window.history.replaceState({}, '', '/');
    }
    return (
      <LoginPage
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLoginSuccess={() => navigateTo('/home')}
      />
    );
  }

  // If authenticated and on login page, redirect to /home
  if (currentPath === '/' || currentPath === '/login') {
    window.history.replaceState({}, '', '/home');
  }

  const handleLogout = () => {
    logout();
    navigateTo('/');
  };

  // Protected Home View
  return (
    <div className="cw-app-layout" data-theme={theme}>
      <Sidebar
        navigationItems={navigationItems}
        patientProfile={patientProfile}
      />
      <HomePage
        patientProfile={patientProfile}
        addDocumentData={addDocumentData}
        careAtGlanceData={careAtGlanceData}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={handleLogout}
        user={user}
      />
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AuthProvider>
      <AppContent theme={theme} onToggleTheme={toggleTheme} />
    </AuthProvider>
  );
}

export default App;
