import React from 'react';
import './EmptyState.css';

export default function EmptyState({ icon, title, description, subtext, actionText, onAction }) {
  return (
    <div className="cw-empty-state">
      {icon && <div className="cw-empty-state-icon">{icon}</div>}
      {title && <h3 className="cw-empty-state-title">{title}</h3>}
      {description && <p className="cw-empty-state-description">{description}</p>}
      {subtext && <p className="cw-empty-state-subtext">{subtext}</p>}
      {actionText && onAction && (
        <button type="button" className="cw-empty-state-action" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
