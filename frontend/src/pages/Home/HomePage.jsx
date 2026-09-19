import React from 'react';
import GreetingHeader from '../../components/GreetingHeader/GreetingHeader';
import AddDocument from '../../components/AddDocument/AddDocument';
import CareAtGlance from '../../components/CareAtGlance/CareAtGlance';
import CareJourneyTimeline from '../../components/CareJourneyTimeline/CareJourneyTimeline';
import './HomePage.css';

export default function HomePage({
  patientProfile,
  addDocumentData,
  careAtGlanceData,
  timelineGroups,
  filterCategories,
  theme,
  onToggleTheme,
}) {
  return (
    <main className="cw-home-page" id="main-content">
      {/* 1. Centered Greeting Header (No Emoji + Dark/Light Theme Toggle) */}
      <GreetingHeader
        patientProfile={patientProfile}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* 2. Add Document Section */}
      <AddDocument data={addDocumentData} />

      {/* 3. Your Care at a Glance (3 Condition Cards + Rainbow Arc Care State) */}
      <CareAtGlance data={careAtGlanceData} />

      {/* 4. Care Journey Timeline (Future Appointments only) */}
      <CareJourneyTimeline
        groups={timelineGroups}
        filterCategories={filterCategories}
      />
    </main>
  );
}
