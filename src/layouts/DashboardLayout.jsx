import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell } from '../components/AppShell/AppShell';
import { DEMO_PATIENT } from '../data/mockData';

export function DashboardLayout() {
  return (
    <AppShell patient={DEMO_PATIENT}>
      <Outlet />
    </AppShell>
  );
}
