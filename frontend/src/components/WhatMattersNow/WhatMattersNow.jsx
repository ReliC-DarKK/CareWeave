import React from 'react';
import './WhatMattersNow.css';

export default function WhatMattersNow({ actionData }) {
  const {
    priorityLevel,
    actionTitle,
    condition,
    orderedBy,
    dueDate,
    description,
    buttonLabel,
    instructionsHint,
  } = actionData;

  return (
    <section className="cw-matters-now-section" aria-labelledby="matters-now-heading">
      <div className="cw-section-header-row">
        <h2 id="matters-now-heading" className="cw-section-heading">
          What Matters Now
        </h2>
        <span className="cw-section-subtext">Actionable priority based on recent clinical notes</span>
      </div>

      <div className="cw-priority-card">
        <div className="cw-priority-card-top">
          <div className="cw-priority-tags-row">
            <span className="cw-priority-badge">{priorityLevel}</span>
            <span className="cw-condition-tag">{condition}</span>
            <span className="cw-due-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {dueDate}
            </span>
          </div>
        </div>

        <div className="cw-priority-card-main">
          <h3 className="cw-priority-title">{actionTitle}</h3>
          <p className="cw-priority-clinician">{orderedBy}</p>
          <p className="cw-priority-desc">{description}</p>
        </div>

        <div className="cw-priority-card-footer">
          <div className="cw-priority-hint">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>{instructionsHint}</span>
          </div>

          <div className="cw-priority-actions">
            <button type="button" className="cw-btn-details">
              <span>{buttonLabel}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
