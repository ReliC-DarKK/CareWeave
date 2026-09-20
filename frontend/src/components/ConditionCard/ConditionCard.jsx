import React from 'react';
import './ConditionCard.css';

export default function ConditionCard({ condition }) {
  const { name, status, theme, iconType } = condition;

  const renderConditionIcon = (type) => {
    switch (type) {
      case 'cancer':
        return (
          /* Pulse / Activity icon matching 1.0 */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        );
      case 'diabetes':
        return (
          /* Droplet icon matching 1.0 */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        );
      case 'hypertension':
        return (
          /* HeartPulse icon matching 1.0 */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
          </svg>
        );
      case 'wellness':
        return (
          /* Sun / Vitality icon */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        );
      case 'medication':
        return (
          /* Pill capsule icon */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
            <path d="m8.5 8.5 7 7" />
          </svg>
        );
      default:
        return (
          /* Shield health icon */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        );
    }
  };

  const getThemeClass = (t) => {
    switch (t) {
      case 'pink':
        return 'cw-cond-rose';
      case 'blue':
        return 'cw-cond-blue';
      case 'green':
      default:
        return 'cw-cond-teal';
    }
  };

  return (
    <div className={`cw-condition-card ${getThemeClass(theme)}`}>
      <div className="cw-condition-icon-box" aria-hidden="true">
        {renderConditionIcon(iconType)}
      </div>
      <div className="cw-condition-meta">
        <h3 className="cw-condition-name">{name}</h3>
        <span className="cw-condition-sub">{status}</span>
      </div>
    </div>
  );
}
