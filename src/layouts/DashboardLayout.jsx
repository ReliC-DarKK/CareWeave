import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppShell } from '../components/AppShell/AppShell';
import { LoadingIndicator } from '../components/LoadingIndicator/LoadingIndicator';
import { DEMO_PATIENT } from '../data/mockData';
import styles from './DashboardLayout.module.css';

export function DashboardLayout() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Brief initial loading presentation for application startup only (~450ms)
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 450);

    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return (
      <LoadingIndicator
        fullScreen
        size="lg"
        label="Preparing your care overview..."
      />
    );
  }

  return (
    <AppShell patient={DEMO_PATIENT}>
      <div key={location.pathname} className={styles.pageTransitionWrapper}>
        <Outlet />
      </div>
    </AppShell>
  );
}

