import React from 'react';
import './AddDocument.css';

export default function AddDocument({ data }) {
  const {
    title = 'Add Document',
    subtitle = 'Upload a medical document to update your care journey.',
    buttonText = '+ Add Document',
  } = data || {};

  return (
    <section className="cw-add-doc-section" aria-label="Add medical document utility">
      <div className="cw-add-doc-container">
        <div className="cw-add-doc-bar">
          <div className="cw-add-doc-text-area">
            <div className="cw-add-doc-title-row">
              <svg
                className="cw-add-doc-icon"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
              <h2 className="cw-add-doc-title">{title}</h2>
            </div>
            <p className="cw-add-doc-subtitle">{subtitle}</p>
          </div>

          <div className="cw-add-doc-action">
            <button
              type="button"
              className="cw-add-doc-btn"
              onClick={() => {
                // Future document upload handler
              }}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
