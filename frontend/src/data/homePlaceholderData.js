/**
 * Temporary placeholder data for CareWeave Project 2.0 Home Page.
 * Matches the visual hierarchy from the CareWeave design reference.
 * This is presentational UI data only and is isolated from future
 * document-processing / backend medical data models.
 */

export const patientProfile = {
  name: 'Aditi Sharma',
  preferredName: 'Aditi',
  role: 'Patient',
  avatarUrl: null,
  avatarInitials: 'AS',
};

export const navigationItems = [
  { id: 'home', label: 'Home', icon: 'home', active: true },
  { id: 'journey', label: 'Care Journey', icon: 'journey', active: false },
  { id: 'records', label: 'Health Records', icon: 'records', active: false },
  { id: 'medications', label: 'Medications', icon: 'medications', active: false },
  { id: 'appointments', label: 'Appointments', icon: 'appointments', active: false },
  { id: 'team', label: 'Care Team', icon: 'team', active: false },
  { id: 'messages', label: 'Messages', icon: 'messages', active: false },
];

export const careAtGlanceData = {
  heading: 'Your Care at a Glance',
  subtitle: 'Multiple conditions. One unified view.',
  conditions: [
    {
      id: 'c-1',
      name: 'Breast Cancer',
      status: 'Treatment · Cycle 3',
      theme: 'pink',
      iconType: 'cancer',
    },
    {
      id: 'c-2',
      name: 'Type 2 Diabetes',
      status: 'Monitoring · Stable',
      theme: 'blue',
      iconType: 'diabetes',
    },
    {
      id: 'c-3',
      name: 'Hypertension',
      status: 'Controlled',
      theme: 'green',
      iconType: 'hypertension',
    },
  ],
  careState: {
    status: 'Stable',
    statusTag: 'Your care state is',
    description: 'Keep following your plan and focus on today\'s actions.',
  },
};

export const addDocumentData = {
  title: 'Add Document',
  subtitle: 'Upload a medical document to update your care journey.',
  buttonText: '+ Add Document',
  acceptedFormats: 'Supported: PDF, lab reports, clinical notes, discharge summaries',
};

export const timelineFilterCategories = [
  { id: 'all', label: 'All', active: true },
  { id: 'conditions', label: 'Conditions', active: false },
  { id: 'tests', label: 'Tests', active: false },
  { id: 'medications', label: 'Medications', active: false },
  { id: 'appointments', label: 'Appointments', active: false },
];

/**
 * Care Journey Timeline showing ONLY future appointments,
 * exactly matching input_file_2.png
 */
export const careJourneyTimelineGroups = [
  {
    id: 'grp-tomorrow',
    dateLabel: 'Tomorrow',
    subDate: 'Apr 16, 2025',
    nodeColor: 'purple',
    events: [
      {
        id: 'ev-1',
        category: 'test',
        iconType: 'flask',
        title: 'Blood Test',
        subtitle: 'CBC, Liver Function, HbA1c',
        badge: 'Upcoming',
        badgeType: 'purple',
      },
    ],
  },
  {
    id: 'grp-apr28',
    dateLabel: 'Apr 28, 2025',
    subDate: null,
    nodeColor: 'purple',
    events: [
      {
        id: 'ev-2',
        category: 'appointment',
        iconType: 'calendar',
        title: 'Oncology Appointment',
        subtitle: 'Dr. Mehta (Medical Oncologist)',
        time: '10:30 AM',
      },
    ],
  },
  {
    id: 'grp-may05',
    dateLabel: 'May 05, 2025',
    subDate: null,
    nodeColor: 'blue',
    events: [
      {
        id: 'ev-3',
        category: 'appointment',
        iconType: 'doctor',
        title: 'Diabetes Follow-up',
        subtitle: 'Dr. Rao (Endocrinologist)',
        time: '2:00 PM',
      },
    ],
  },
];
