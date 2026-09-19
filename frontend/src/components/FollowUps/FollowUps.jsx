import React from 'react';
import './FollowUps.css';

export default function FollowUps({ followUps }) {
  const renderItemIcon = (type) => {
    switch (type) {
      case 'log':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
        );
      case 'refill':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
        );
      case 'appointment':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        );
      default:
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="8"></circle>
          </svg>
        );
    }
  };

  return (
    <section className="cw-followups-section" aria-labelledby="followups-heading">
      <div className="cw-followups-header">
        <h3 id="followups-heading" className="cw-followups-title">
          Upcoming Follow-ups
        </h3>
        <span className="cw-followups-count">{followUps.length} items scheduled</span>
      </div>

      <div className="cw-followups-list">
        {followUps.map((item) => (
          <div key={item.id} className="cw-followup-item">
            <div className="cw-followup-icon-wrap" aria-hidden="true">
              {renderItemIcon(item.type)}
            </div>

            <div className="cw-followup-info">
              <span className="cw-followup-item-title">{item.title}</span>
              <span className="cw-followup-item-context">{item.context}</span>
            </div>

            <div className="cw-followup-due-badge">
              <span>{item.dueDate}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
