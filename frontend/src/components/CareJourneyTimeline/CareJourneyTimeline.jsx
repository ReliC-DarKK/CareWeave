import React, { useState } from 'react';
import EventDetailModal from './EventDetailModal';
import './CareJourneyTimeline.css';

export default function CareJourneyTimeline({
  events = [],
  isLoading = false,
  error = null,
  onRetry = null,
  onOpenUpload = null,
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filterCategories = [
    { id: 'all', label: 'All' },
    { id: 'labs', label: 'Lab Reports' },
    { id: 'consultations', label: 'Consultations & Other' },
  ];

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
      case 'doctor':
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case 'document':
      default:
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B4DF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
    }
  };

  // Filter events based on active filter tab
  const filteredEvents = events.filter((evt) => {
    if (activeFilter === 'all') return true;
    const docType = (evt.documentType || '').toUpperCase();
    if (activeFilter === 'labs') {
      return docType.includes('LAB');
    }
    if (activeFilter === 'consultations') {
      return !docType.includes('LAB');
    }
    return true;
  });

  return (
    <section className="cw-timeline-section" aria-labelledby="timeline-heading">
      <div className="cw-timeline-container">
        <div className="cw-timeline-card">
          {/* Header */}
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
                <p className="cw-timeline-subtitle">Your health journey, assembled from your medical documents.</p>
              </div>
            </div>

            {/* Filter Pills */}
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

          {/* Loading State */}
          {isLoading && (
            <div className="cw-timeline-status-box cw-timeline-loading">
              <div className="cw-timeline-spinner" aria-hidden="true" />
              <span>Loading Care Journey...</span>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="cw-timeline-status-box cw-timeline-error">
              <p className="cw-error-text">{error}</p>
              {onRetry && (
                <button type="button" className="cw-btn-retry" onClick={onRetry}>
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && events.length === 0 && (
            <div className="cw-timeline-empty-box">
              <div className="cw-empty-icon-wrap" aria-hidden="true">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5B4DF5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h3 className="cw-empty-title">No care journey available yet.</h3>
              <p className="cw-empty-desc">
                Upload a medical document to start building your care journey.
              </p>
              {onOpenUpload && (
                <button
                  type="button"
                  className="cw-btn-empty-upload"
                  onClick={onOpenUpload}
                >
                  Upload Medical Document
                </button>
              )}
            </div>
          )}

          {/* Timeline Stream with Real Events */}
          {!isLoading && !error && filteredEvents.length > 0 && (
            <div className="cw-timeline-stream">
              {filteredEvents.map((event, index) => {
                const isLab = (event.documentType || '').toUpperCase().includes('LAB');
                const isCardioOrConsult = (event.documentType || '').toUpperCase().includes('CARDIO') || (event.documentType || '').toUpperCase().includes('CONSULT');
                const iconType = isLab ? 'flask' : (isCardioOrConsult ? 'doctor' : 'document');
                const nodeColor = isLab ? 'purple' : 'blue';

                const subtitle = event.doctor?.name
                  ? `${event.doctor.name}${event.clinic ? ` · ${event.clinic}` : ''}`
                  : (event.summary || 'Medical Record');

                const badgeText = event.tests && event.tests.length > 0
                  ? `${event.tests.length} tests`
                  : (event.medications && event.medications.length > 0
                    ? `${event.medications.length} meds`
                    : null);

                return (
                  <div key={event.id} className="cw-timeline-row">
                    {/* Date Column */}
                    <div className="cw-timeline-date-col">
                      <span className="cw-date-primary">{event.date}</span>
                      {event.dateSource === 'UPLOAD_DATE' && (
                        <span className="cw-date-secondary">Uploaded</span>
                      )}
                    </div>

                    {/* Node Track with dot and connecting stem */}
                    <div className="cw-timeline-track">
                      <div className={`cw-timeline-dot cw-dot-${nodeColor}`} aria-hidden="true" />
                      {index < filteredEvents.length - 1 && (
                        <div className="cw-timeline-stem" aria-hidden="true" />
                      )}
                    </div>

                    {/* Event Card Column */}
                    <div className="cw-timeline-events-col">
                      <div
                        className="cw-event-card cw-event-card-clickable"
                        onClick={() => setSelectedEvent(event)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedEvent(event);
                          }
                        }}
                        aria-label={`View details for ${event.title}, ${event.date}`}
                      >
                        {/* Icon circle */}
                        <div className={`cw-event-icon-circle cw-event-icon-${iconType}`} aria-hidden="true">
                          {renderCategoryIcon(iconType)}
                        </div>

                        {/* Content info */}
                        <div className="cw-event-content">
                          <h3 className="cw-event-title">{event.title}</h3>
                          <div className="cw-event-meta">
                            <span className="cw-event-subtitle">{subtitle}</span>
                          </div>
                        </div>

                        {/* Optional status / count badge */}
                        {badgeText && (
                          <div className="cw-event-badge-wrap">
                            <span className="cw-event-badge">
                              {badgeText}
                            </span>
                          </div>
                        )}

                        {/* Right Chevron Arrow */}
                        <div className="cw-event-chevron" aria-hidden="true">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Filter produced 0 results when events exist */}
          {!isLoading && !error && events.length > 0 && filteredEvents.length === 0 && (
            <div className="cw-timeline-empty-box">
              <p className="cw-empty-desc">No events found in this category.</p>
              <button
                type="button"
                className="cw-btn-secondary"
                onClick={() => setActiveFilter('all')}
              >
                Show All Events
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Real Source Document Detail Modal */}
      <EventDetailModal
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
}
