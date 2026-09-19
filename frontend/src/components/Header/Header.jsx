import React from 'react';
import './Header.css';

export default function Header({ patientProfile }) {
  return (
    <header className="cw-top-header">
      <div className="cw-header-content">
        <div className="cw-greeting-area">
          <h1 className="cw-greeting-title">
            Good morning, {patientProfile.preferredName || patientProfile.name}
          </h1>
          <p className="cw-greeting-subtitle">
            Here's your current care state and what matters most today.
          </p>
          <div className="cw-context-meta">
            <span className="cw-meta-pill">
              <span className="cw-meta-dot"></span>
              Last document: <strong>{patientProfile.lastDocument}</strong>
            </span>
            <span className="cw-meta-divider">·</span>
            <span className="cw-meta-item">
              Care Coordinator: <strong>{patientProfile.careCoordinator}</strong>
            </span>
            <span className="cw-meta-divider">·</span>
            <span className="cw-meta-item">
              Next review: <strong>in {patientProfile.nextReviewDays} days</strong>
            </span>
          </div>
        </div>

        <div className="cw-header-actions">
          <button
            type="button"
            className="cw-btn-add-document"
            aria-label="Add medical document"
            onClick={() => {
              // Presentational for now - will connect to upload flow later
            }}
          >
            <span className="cw-btn-icon" aria-hidden="true">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </span>
            <span className="cw-btn-text">Add Document</span>
          </button>
        </div>
      </div>
    </header>
  );
}
