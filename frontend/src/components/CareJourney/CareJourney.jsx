import React from 'react';
import './CareJourney.css';

export default function CareJourney({ events }) {
  return (
    <section className="cw-care-journey-section" aria-labelledby="journey-heading">
      <div className="cw-journey-header">
        <div>
          <h2 id="journey-heading" className="cw-journey-title">
            Care Journey
          </h2>
          <p className="cw-journey-subtitle">
            Longitudinal chronological timeline assembled across clinical visits and documents
          </p>
        </div>
        <button type="button" className="cw-btn-journey-viewall">
          <span>Full Journey Timeline</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div className="cw-timeline-container">
        <div className="cw-timeline-track" aria-hidden="true"></div>

        <div className="cw-timeline-events">
          {events.map((event, index) => (
            <div key={event.id} className="cw-timeline-node">
              <div className="cw-node-marker-wrap">
                <div className={`cw-node-marker cw-marker-${event.badgeColor}`}>
                  <div className="cw-marker-core"></div>
                </div>
              </div>

              <div className="cw-node-card">
                <div className="cw-node-header">
                  <div className="cw-node-title-group">
                    <span className="cw-node-date">{event.date}</span>
                    <span className="cw-node-relative">({event.relativeTime})</span>
                    <span className={`cw-node-tag cw-node-tag-${event.badgeColor}`}>
                      {event.condition}
                    </span>
                  </div>
                </div>

                <div className="cw-node-main">
                  <h3 className="cw-node-title">{event.title}</h3>
                  <div className="cw-node-meta">
                    <span className="cw-node-clinician">{event.clinician}</span>
                    <span className="cw-node-meta-sep">·</span>
                    <span className="cw-node-clinic">{event.clinic}</span>
                  </div>
                  {event.summary && <p className="cw-node-summary">{event.summary}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
