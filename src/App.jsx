import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Home } from './pages/Home';
import { CareJourney } from './pages/CareJourney';
import { HealthRecords } from './pages/HealthRecords';
import { Medications } from './pages/Medications';
import { Appointments } from './pages/Appointments';
import { CareTeamPage } from './pages/CareTeamPage';
import { Messages } from './pages/Messages';

import { CareDataProvider } from './context/CareDataContext';

export function App() {
  return (
    <CareDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Home />} />
            <Route path="journey" element={<CareJourney />} />
            <Route path="records" element={<HealthRecords />} />
            <Route path="medications" element={<Medications />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="care-team" element={<CareTeamPage />} />
            <Route path="messages" element={<Messages />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CareDataProvider>
  );
}

export default App;
