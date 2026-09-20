import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login/LoginPage';
import Sidebar from './components/Sidebar/Sidebar';
import HomePage from './pages/Home/HomePage';
import CareJourneyPage from './pages/CareJourney/CareJourneyPage';
import HealthRecordsPage from './pages/HealthRecords/HealthRecordsPage';
import MedicationsPage from './pages/Medications/MedicationsPage';
import AppointmentsPage from './pages/Appointments/AppointmentsPage';
import CareTeamPage from './pages/CareTeam/CareTeamPage';
import MessagesPage from './pages/Messages/MessagesPage';
import patientService from './services/patientService';
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
  const [activePatientId, setActivePatientId] = useState(null);
  const [activePatient, setActivePatient] = useState(null);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  }, []);

  // Deterministic active patient resolution
  const resolveActivePatient = useCallback(async (preferredId) => {
    if (!isAuthenticated) return;
    try {
      const res = await patientService.getPatients();
      const patients = res?.patients || [];
      if (patients.length === 0) {
        setActivePatient(null);
        setActivePatientId(null);
        return;
      }

      let selected = null;
      if (preferredId) {
        selected = patients.find((p) => p.id === preferredId);
      }
      if (!selected && activePatientId) {
        selected = patients.find((p) => p.id === activePatientId);
      }
      if (!selected) {
        // Deterministic preference: match logged in user first
        const userFirstName = (user?.preferredName || user?.name?.split(' ')[0] || '').toLowerCase();
        selected = (userFirstName && patients.find((p) => p.name.toLowerCase().includes(userFirstName))) ||
                   patients.find((p) => p.documentCount > 0) ||
                   patients[0];
      }

      if (selected) {
        setActivePatient(selected);
        setActivePatientId(selected.id);
      }
    } catch (err) {
      console.error('Error resolving active patient in App:', err);
    }
  }, [isAuthenticated, activePatientId, user]);

  useEffect(() => {
    if (isAuthenticated) {
      resolveActivePatient();
    } else {
      setActivePatient(null);
      setActivePatientId(null);
    }
  }, [isAuthenticated, user?.email, resolveActivePatient]);

  const handlePatientAssociated = useCallback((newPatientId) => {
    if (newPatientId && !activePatientId) {
      setActivePatientId(newPatientId);
      resolveActivePatient(newPatientId);
    }
  }, [activePatientId, resolveActivePatient]);

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

  // If unauthenticated: guard routes and force Login
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
    setActivePatient(null);
    setActivePatientId(null);
    logout();
    navigateTo('/');
  };

  const currentPatientProfile = activePatient
    ? {
        ...patientProfile,
        name: activePatient.name,
        preferredName: activePatient.name.split(' ')[0],
      }
    : (user?.name
        ? {
            ...patientProfile,
            name: user.name,
            preferredName: user.preferredName || user.name.split(' ')[0],
          }
        : patientProfile);

  // Route Switcher
  const renderCurrentPage = () => {
    switch (currentPath) {
      case '/care-journey':
        return (
          <CareJourneyPage
            activePatient={activePatient}
            patientProfile={currentPatientProfile}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onLogout={handleLogout}
            user={user}
            onPatientAssociated={handlePatientAssociated}
          />
        );
      case '/health-records':
        return (
          <HealthRecordsPage
            activePatient={activePatient}
            patientProfile={currentPatientProfile}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onLogout={handleLogout}
            user={user}
            onPatientAssociated={handlePatientAssociated}
          />
        );
      case '/medications':
        return (
          <MedicationsPage
            activePatient={activePatient}
            patientProfile={currentPatientProfile}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onLogout={handleLogout}
            user={user}
            onPatientAssociated={handlePatientAssociated}
          />
        );
      case '/appointments':
        return (
          <AppointmentsPage
            patientProfile={currentPatientProfile}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onLogout={handleLogout}
            user={user}
          />
        );
      case '/care-team':
        return (
          <CareTeamPage
            patientProfile={currentPatientProfile}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onLogout={handleLogout}
            user={user}
          />
        );
      case '/messages':
        return (
          <MessagesPage
            patientProfile={currentPatientProfile}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onLogout={handleLogout}
            user={user}
          />
        );
      case '/home':
      default:
        return (
          <HomePage
            patientProfile={currentPatientProfile}
            addDocumentData={addDocumentData}
            careAtGlanceData={careAtGlanceData}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onLogout={handleLogout}
            user={user}
            activePatient={activePatient}
            setActivePatientId={setActivePatientId}
            onPatientAssociated={handlePatientAssociated}
          />
        );
    }
  };

  // Protected View Layout
  return (
    <div className="cw-app-layout" data-theme={theme}>
      <Sidebar
        navigationItems={navigationItems}
        patientProfile={currentPatientProfile}
        currentPath={currentPath}
        onNavigate={navigateTo}
        user={user}
      />
      {renderCurrentPage()}
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
