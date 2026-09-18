# CareWeave — Frontend Architecture & Home Dashboard

## 1. Existing Frontend Stack

The repository is **empty** — only a `README.md` with `# CareWeave`. No framework, no `package.json`, no config files.

**System environment:**
- Node.js v24.12.0
- npm 11.6.2

---

## 2. Proposed Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **React 18 + Vite** | Fast setup, instant HMR, zero-config, hackathon-friendly. React is the easiest for other team members to integrate with. |
| Language | **JavaScript (JSX)** | TypeScript adds setup overhead for an 8-hour prototype. Easy to convert later. |
| Routing | **React Router v6** | Lightweight, standard. Needed for nav between pages. |
| Styling | **Vanilla CSS** (CSS Modules via Vite) | Per your design direction — no Tailwind, no CSS-in-JS. Clean separation. Vite supports `.module.css` out of the box. |
| Icons | **Lucide React** | Clean, clinical line icons. Lightweight. No visual noise. |
| Font | **Montserrat** (via Google Fonts CDN) | Per design direction. |
| Package manager | **npm** | Already available, no extra tooling needed. |

**No additional heavy dependencies.** No state management library — React props and context are sufficient for this prototype.

---

## 3. Proposed Folder Structure

```
CareWeave/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/                    # Static assets (images, etc.)
│   ├── components/                # Reusable UI components
│   │   ├── AppShell/
│   │   │   ├── AppShell.jsx
│   │   │   └── AppShell.module.css
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Sidebar.module.css
│   │   ├── Header/
│   │   │   ├── Header.jsx
│   │   │   └── Header.module.css
│   │   ├── CareAtGlance/
│   │   │   ├── CareAtGlance.jsx
│   │   │   └── CareAtGlance.module.css
│   │   ├── ConditionSummary/
│   │   │   ├── ConditionSummary.jsx
│   │   │   └── ConditionSummary.module.css
│   │   ├── CareState/
│   │   │   ├── CareState.jsx
│   │   │   └── CareState.module.css
│   │   ├── Timeline/
│   │   │   ├── Timeline.jsx
│   │   │   ├── TimelineEvent.jsx
│   │   │   └── Timeline.module.css
│   │   ├── NextAction/
│   │   │   ├── NextAction.jsx
│   │   │   └── NextAction.module.css
│   │   ├── RecentUpdates/
│   │   │   ├── RecentUpdates.jsx
│   │   │   └── RecentUpdates.module.css
│   │   ├── CareGaps/
│   │   │   ├── CareGaps.jsx
│   │   │   └── CareGaps.module.css
│   │   ├── CareTeam/
│   │   │   ├── CareTeam.jsx
│   │   │   └── CareTeam.module.css
│   │   └── QuickLinks/
│   │       ├── QuickLinks.jsx
│   │       └── QuickLinks.module.css
│   ├── data/                      # Mock data (single source of truth)
│   │   └── mockData.js
│   ├── layouts/                   # Page layouts
│   │   └── DashboardLayout.jsx
│   ├── pages/                     # Route-level pages
│   │   ├── Home.jsx
│   │   ├── CareJourney.jsx        # Placeholder
│   │   ├── HealthRecords.jsx      # Placeholder
│   │   ├── Medications.jsx        # Placeholder
│   │   ├── Appointments.jsx       # Placeholder
│   │   ├── CareTeamPage.jsx       # Placeholder
│   │   └── Messages.jsx           # Placeholder
│   ├── services/                  # Future API service layer (empty for now)
│   │   └── README.md
│   ├── styles/                    # Global styles & design tokens
│   │   ├── variables.css          # CSS custom properties (colors, spacing, type scale)
│   │   └── global.css             # Reset, base typography, utilities
│   ├── utils/                     # Utility functions
│   │   └── helpers.js
│   ├── App.jsx                    # Root component + router
│   └── main.jsx                   # Entry point
├── index.html
├── package.json
├── vite.config.js
└── .gitignore
```

---

## 4. Proposed Component Hierarchy

```
App
└── BrowserRouter
    └── DashboardLayout
        ├── Sidebar (navigation)
        └── <main>
            ├── Header (greeting, date context)
            └── [Route: Home]
                ├── CareAtGlance
                │   └── ConditionSummary × N
                ├── CareState
                ├── Timeline
                │   └── TimelineEvent × N
                ├── NextAction (placeholder)
                ├── RecentUpdates
                ├── CareGaps
                ├── CareTeam
                └── QuickLinks
```

- **DashboardLayout** wraps Sidebar + main content area for all pages.
- **Home** is the only fully built page. Other nav items render placeholder pages with a heading.
- All dashboard sections receive data as **props** from the Home page, which imports from `data/mockData.js`.

---

## 5. Proposed Mock Data Structure

All mock data lives in `src/data/mockData.js` as exported constants. Structures are designed to mirror future API shapes.

```js
// Patient
export const patient = {
  id: "p-001",
  firstName: "Aditi",
  lastName: "Sharma",
  dateOfBirth: "1975-03-14",
  avatar: null,  // optional
};

// Conditions
export const conditions = [
  {
    id: "c-001",
    name: "Breast Cancer",
    status: "Active — In Treatment",
    stage: "Stage IIA",
    diagnosedDate: "2025-11-20",
    nextMilestone: "Chemotherapy Cycle 4 — Sep 22",
    provider: "Dr. Meera Kapoor",
    specialty: "Oncology",
  },
  {
    id: "c-002",
    name: "Type 2 Diabetes",
    status: "Managed",
    diagnosedDate: "2019-06-10",
    lastReading: { type: "HbA1c", value: "7.2%", date: "2026-08-28" },
    nextMilestone: "HbA1c recheck — Oct 5",
    provider: "Dr. Arjun Patel",
    specialty: "Endocrinology",
  },
  {
    id: "c-003",
    name: "Hypertension",
    status: "Stable",
    diagnosedDate: "2020-01-15",
    lastReading: { type: "BP", value: "132/84 mmHg", date: "2026-09-15" },
    nextMilestone: "BP review at next visit",
    provider: "Dr. Arjun Patel",
    specialty: "Internal Medicine",
  },
];

// Care State (overall summary)
export const careState = {
  overallStatus: "On Track",           // "On Track" | "Needs Attention" | "Action Required"
  conditionsManaged: 3,
  upcomingAppointments: 2,
  pendingActions: 3,
  lastUpdated: "2026-09-18",
};

// Timeline Events
export const timelineEvents = [
  {
    id: "t-001",
    date: "2026-09-18",
    time: "08:00",
    type: "reading",                   // reading | medication | test | appointment | note
    title: "Blood Glucose",
    detail: "Fasting: 128 mg/dL",
    conditionId: "c-002",
  },
  {
    id: "t-002",
    date: "2026-09-17",
    time: "09:30",
    type: "medication",
    title: "Metformin 500mg",
    detail: "Taken as scheduled",
    conditionId: "c-002",
  },
  {
    id: "t-003",
    date: "2026-09-16",
    time: "11:00",
    type: "test",
    title: "Complete Blood Count",
    detail: "Results normal — WBC within range",
    conditionId: "c-001",
  },
  {
    id: "t-004",
    date: "2026-09-15",
    time: "14:00",
    type: "appointment",
    title: "Oncology Follow-up",
    detail: "Dr. Meera Kapoor — treatment response reviewed",
    conditionId: "c-001",
  },
  {
    id: "t-005",
    date: "2026-09-14",
    time: "10:00",
    type: "appointment",
    title: "Diabetes Review",
    detail: "Dr. Arjun Patel — medication adjustment discussed",
    conditionId: "c-002",
  },
];

// Next Actions (placeholder — logic will come from Person 1)
export const nextActions = [
  {
    id: "na-001",
    priority: "high",
    title: "Schedule chemotherapy cycle 4",
    description: "Due by Sep 22. Contact oncology clinic.",
    conditionId: "c-001",
    dueDate: "2026-09-22",
  },
  {
    id: "na-002",
    priority: "medium",
    title: "Upload fasting glucose log",
    description: "3-day log needed before endocrinology visit.",
    conditionId: "c-002",
    dueDate: "2026-10-02",
  },
  {
    id: "na-003",
    priority: "low",
    title: "Refill Amlodipine prescription",
    description: "7 days remaining. Request refill from pharmacy.",
    conditionId: "c-003",
    dueDate: "2026-09-25",
  },
];

// Recent Updates
export const recentUpdates = [
  {
    id: "ru-001",
    date: "2026-09-18",
    title: "Lab results available",
    summary: "CBC and metabolic panel results are ready for review.",
    type: "lab",
  },
  {
    id: "ru-002",
    date: "2026-09-17",
    title: "Appointment confirmed",
    summary: "Oncology visit on Sep 22 confirmed by clinic.",
    type: "appointment",
  },
  {
    id: "ru-003",
    date: "2026-09-16",
    title: "Medication reminder",
    summary: "Amlodipine prescription expires in 7 days.",
    type: "medication",
  },
];

// Care Gaps
export const careGaps = [
  {
    id: "cg-001",
    title: "Annual eye exam overdue",
    description: "Recommended for diabetes patients. Last exam: Jan 2025.",
    severity: "moderate",
    conditionId: "c-002",
  },
  {
    id: "cg-002",
    title: "Mammogram scheduling",
    description: "Follow-up imaging recommended post-treatment.",
    severity: "high",
    conditionId: "c-001",
  },
];

// Care Team
export const careTeam = [
  {
    id: "ct-001",
    name: "Dr. Meera Kapoor",
    role: "Oncologist",
    specialty: "Breast Oncology",
    lastVisit: "2026-09-15",
    nextVisit: "2026-09-22",
    contact: "meera.kapoor@hospital.org",
  },
  {
    id: "ct-002",
    name: "Dr. Arjun Patel",
    role: "Endocrinologist",
    specialty: "Diabetes Management",
    lastVisit: "2026-09-14",
    nextVisit: "2026-10-05",
    contact: "arjun.patel@hospital.org",
  },
  {
    id: "ct-003",
    name: "Nurse Priya Singh",
    role: "Care Coordinator",
    specialty: "Care Navigation",
    lastVisit: null,
    nextVisit: null,
    contact: "priya.singh@hospital.org",
  },
];

// Quick Links
export const quickLinks = [
  { id: "ql-001", label: "Book Appointment", icon: "calendar", href: "/appointments" },
  { id: "ql-002", label: "Message Care Team", icon: "message-square", href: "/messages" },
  { id: "ql-003", label: "View Medications", icon: "pill", href: "/medications" },
  { id: "ql-004", label: "Upload Document", icon: "upload", href: "/health-records" },
];
```

---

## 6. Dependencies to Add

| Package | Purpose |
|---|---|
| `react` + `react-dom` | Core UI library (installed via Vite template) |
| `react-router-dom` | Client-side routing |
| `lucide-react` | Icon set — clean, clinical line icons |

That's it. Three dependencies beyond the Vite scaffold. No state library, no CSS framework, no UI kit.

---

## 7. Key Assumptions

1. **No backend yet.** All data comes from `src/data/mockData.js`. The `services/` folder is a placeholder for when Person 2 provides APIs.
2. **Next Best Action is frontend-only.** The component renders mock data. The determination logic will come from Person 1.
3. **No authentication in this initial task.** Security layer (your other scope) will be a separate task.
4. **Desktop-first.** The CSS grid layout will use `min()` / responsive units so it doesn't break on tablet, but I won't build a dedicated mobile nav or layout.
5. **Placeholder pages** for all nav items except Home — they'll render a simple heading + "Coming soon" so the shell feels complete during demo.
6. **Montserrat** loaded from Google Fonts CDN. Falls back to system sans-serif.
7. **CSS custom properties** in `variables.css` define the full design token set (colors, spacing, type scale, radii) so other team members can use them consistently.

---

## Design Token Preview

```css
:root {
  /* Surfaces */
  --color-bg:          #F4F5F7;
  --color-surface:     #FFFFFF;
  --color-surface-alt: #FAFBFC;

  /* Text */
  --color-text:        #1E2A3A;
  --color-text-secondary: #5A6577;
  --color-text-muted:  #8C95A6;

  /* Accent — muted indigo */
  --color-accent:      #5C6BC0;
  --color-accent-light:#E8EAF6;

  /* Clinical — muted teal (used sparingly) */
  --color-clinical:    #26A69A;
  --color-clinical-light: #E0F2F1;

  /* Status */
  --color-status-high:    #C62828;
  --color-status-medium:  #E65100;
  --color-status-low:     #5A6577;

  /* Borders */
  --color-border:      #E2E5EA;

  /* Spacing scale */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Typography */
  --font-family: 'Montserrat', sans-serif;
  --font-size-xs:   0.75rem;
  --font-size-sm:   0.8125rem;
  --font-size-base: 0.9375rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.5rem;
  --font-size-2xl:  1.75rem;

  /* Radius — restrained */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

---

## Verification Plan

### After Implementation
- `npm run dev` starts successfully
- All seven nav items route correctly
- Home dashboard renders all nine sections with mock data
- No console errors
- Layout doesn't break at 1024px viewport width
- Visual spot-check against design direction (clinical, calm, no neon/glow)
