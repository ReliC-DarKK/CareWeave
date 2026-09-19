import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import HomePage from './pages/Home/HomePage';
import {
  patientProfile,
  navigationItems,
  addDocumentData,
  careAtGlanceData,
  careJourneyTimelineGroups,
  timelineFilterCategories,
} from './data/homePlaceholderData';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

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
        timelineGroups={careJourneyTimelineGroups}
        filterCategories={timelineFilterCategories}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}

export default App;
