import React from 'react';
import './CareState.css';

export default function CareState({ careState }) {
  const {
    status = 'Stable',
    statusTag = 'Your care state is',
    description = 'Keep following your plan and focus on today\'s actions.',
  } = careState || {};

  return (
    <div className="cw-care-state-section" aria-label="Overall Care State">
      {/* 1.0 Arc Meter Container */}
      <div className="cw-meter-container">
        <svg
          className="cw-meter-svg"
          viewBox="0 0 160 90"
          width="160"
          height="85"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="glanceArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* Background Inactive Track */}
          <path
            d="M 15 80 A 65 65 0 0 1 145 80"
            fill="none"
            stroke="var(--cw-border-card)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Multicolored Arc Progression */}
          <path
            className="cw-meter-arc-active"
            d="M 15 80 A 65 65 0 0 1 145 80"
            fill="none"
            stroke="url(#glanceArcGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            pathLength="100"
          />
        </svg>

        {/* Centered Patient Icon inside Arc Cavity */}
        <div className="cw-meter-center-icon">
          <svg
            className="cw-person-icon"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#059669"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>

      {/* State Text Group matching 1.0 */}
      <div className="cw-state-text-group">
        <span className="cw-state-intro">{statusTag}</span>
        <span className="cw-state-value">{status}</span>
        <p className="cw-state-subtext">{description}</p>
      </div>
    </div>
  );
}
