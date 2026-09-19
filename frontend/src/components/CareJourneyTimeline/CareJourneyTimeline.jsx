import React, { useState } from 'react';
import './CareJourneyTimeline.css';

export default function CareJourneyTimeline({ groups = [], filterCategories = [] }) {
  const [activeFilter, setActiveFilter] = useState('all');

  const renderCategoryIcon = (iconType) => {
    switch (iconType) {
      case 'flask':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 2v7.31L4.72 20.44a2 2 0 0 0 1.74 2.89h11.08a2 2 0 0 0 1.74-2.89L14 9.31V2" />
            <line x1="8" y1="2" x2="16" y2="2" />
            <line x1="6.8" y1="15" x2="17.2" y2="15" />
          </svg>
        );
      case 'calendar':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'doctor':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B4DF5" strokeWidth="2">
            <circle cx="12" cy="12" r="8" />
          </svg>
        );
    }
  };

  return (
    <section className="cw-timeline-section" aria-labelledby="timeline-heading">
      <div className="cw-timeline-container">
        <div className="cw-timeline-card">
          {/* Header matching 1.0 */}
          <div className="cw-timeline-header">
            <div className="cw-timeline-title-group">
              <div className="cw-timeline-icon-box" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5B4DF5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <h2 id="timeline-heading" className="cw-timeline-title">
                  Care Journey Timeline
                </h2>
                <p className="cw-timeline-subtitle">Your health journey, all in one place.</p>
              </div>
            </div>

            {/* Filter Pills matching 1.0 */}
            <div className="cw-timeline-filters" role="tablist" aria-label="Timeline category filters">
              {filterCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === cat.id}
                  className={`cw-filter-btn ${activeFilter === cat.id ? 'cw-filter-btn-active' : ''}`}
                  onClick={() => setActiveFilter(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Future Appointments Stream matching input_file_2.png */}
          <div className="cw-timeline-stream">
            {groups.map((group, index) => (
              <div key={group.id} className="cw-timeline-row">
                {/* Date Column */}
                <div className="cw-timeline-date-col">
                  <span className="cw-date-primary">{group.dateLabel}</span>
                  {group.subDate && (
                    <span className="cw-date-secondary">{group.subDate}</span>
                  )}
                </div>

                {/* Node Track with dot and connecting stem */}
                <div className="cw-timeline-track">
                  <div className={`cw-timeline-dot cw-dot-${group.nodeColor}`} aria-hidden="true" />
                  {index < groups.length - 1 && (
                    <div className="cw-timeline-stem" aria-hidden="true" />
                  )}
                </div>

                {/* Event Card Column */}
                <div className="cw-timeline-events-col">
                  {group.events.map((event) => (
                    <div key={event.id} className="cw-event-card">
                      {/* Icon circle */}
                      <div className={`cw-event-icon-circle cw-event-icon-${event.iconType}`} aria-hidden="true">
                        {renderCategoryIcon(event.iconType)}
                      </div>

                      {/* Content info */}
                      <div className="cw-event-content">
                        <h3 className="cw-event-title">{event.title}</h3>
                        <div className="cw-event-meta">
                          <span className="cw-event-subtitle">{event.subtitle}</span>
                          {event.time && (
                            <span className="cw-event-time">{event.time}</span>
                          )}
                        </div>
                      </div>

                      {/* Optional status badge */}
                      {event.badge && (
                        <div className="cw-event-badge-wrap">
                          <span className="cw-event-badge">
                            {event.badge}
                          </span>
                        </div>
                      )}

                      {/* Right Chevron Arrow (1.0 exact) */}
                      <div className="cw-event-chevron" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
