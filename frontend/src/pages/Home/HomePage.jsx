import React, { useState } from 'react';
import GreetingHeader from '../../components/GreetingHeader/GreetingHeader';
import AddDocument from '../../components/AddDocument/AddDocument';
import CareAtGlance from '../../components/CareAtGlance/CareAtGlance';
import CareJourneyTimeline from '../../components/CareJourneyTimeline/CareJourneyTimeline';
import DocumentUploadModal from '../../components/DocumentUploadModal/DocumentUploadModal';
import './HomePage.css';

export default function HomePage({
  patientProfile,
  addDocumentData,
  careAtGlanceData,
  timelineGroups,
  filterCategories,
  theme,
  onToggleTheme,
  onLogout,
  user,
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <main className="cw-home-page" id="main-content">
      {/* 1. Greeting Header with Theme Toggle + Logout */}
      <GreetingHeader
        patientProfile={patientProfile}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        user={user}
      />

      {/* 2. Add Document Section (Triggers Upload Modal) */}
      <AddDocument
        data={addDocumentData}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      {/* 3. Your Care at a Glance (3 Condition Cards + Rainbow Arc Care State) */}
      <CareAtGlance data={careAtGlanceData} />

      {/* 4. Care Journey Timeline (Future Appointments only) */}
      <CareJourneyTimeline
        groups={timelineGroups}
        filterCategories={filterCategories}
      />

      {/* 5. Document Upload Modal Dialog */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={(doc) => {
          // Document upload successful (later phases will trigger document reading/extraction)
          console.log('Uploaded medical document successfully:', doc);
        }}
      />
    </main>
  );
}
