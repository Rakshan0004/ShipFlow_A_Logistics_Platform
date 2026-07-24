import React from 'react';
import './EmptyState.css';

export function EmptyState({ 
  icon = '📭',
  title = 'No data found',
  message = 'There is no data to display at this time.',
  action,
  className = '' 
}) {
  return (
    <div className={`empty-state ${className}`} role="status">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

export default EmptyState;
