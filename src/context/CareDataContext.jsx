import React, { createContext, useContext, useState } from 'react';
import { DEMO_MEDICATIONS, DEMO_HEALTH_RECORDS_DATA } from '../data/mockData';

const CareDataContext = createContext(null);

export function CareDataProvider({ children }) {
  const [medications, setMedications] = useState(DEMO_MEDICATIONS);
  const [healthRecords, setHealthRecords] = useState(DEMO_HEALTH_RECORDS_DATA);
  const [recentlyExtractedMed, setRecentlyExtractedMed] = useState(null);

  const addUploadedRecordAndMedication = (newDocument, newMedication) => {
    if (newDocument) {
      setHealthRecords((prev) => ({
        ...prev,
        healthDocuments: [newDocument, ...prev.healthDocuments],
      }));
    }

    if (newMedication) {
      setMedications((prev) => [newMedication, ...prev]);
      setRecentlyExtractedMed(newMedication);
    }
  };

  return (
    <CareDataContext.Provider
      value={{
        medications,
        healthRecords,
        recentlyExtractedMed,
        addUploadedRecordAndMedication,
      }}
    >
      {children}
    </CareDataContext.Provider>
  );
}

export function useCareData() {
  const context = useContext(CareDataContext);
  if (!context) {
    throw new Error('useCareData must be used within a CareDataProvider');
  }
  return context;
}
