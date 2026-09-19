import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Home } from './pages/Home';
import { CareJourney } from './pages/CareJourney';
import { HealthRecords } from './pages/HealthRecords';
import { Medications } from './pages/Medications';
import { Appointments } from './pages/Appointments';
import { CareTeamPage } from './pages/CareTeamPage';
import { Messages } from './pages/Messages';
import { Login } from './pages/Login';

import { CareDataProvider } from './context/CareDataContext';

export function App() {
  return (
    <AuthProvider>
      <CareDataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="journey" element={<ProtectedRoute><CareJourney /></ProtectedRoute>} />
              <Route path="records" element={<ProtectedRoute><HealthRecords /></ProtectedRoute>} />
              <Route path="medications" element={<ProtectedRoute><Medications /></ProtectedRoute>} />
              <Route path="appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
              <Route path="care-team" element={<ProtectedRoute><CareTeamPage /></ProtectedRoute>} />
              <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CareDataProvider>
    </AuthProvider>
  );
}

export default App;
