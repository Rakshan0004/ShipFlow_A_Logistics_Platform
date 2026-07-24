import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ id, message, type, onRemove }) {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onRemove(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ⓘ';
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert">
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button
        className="toast-close"
        onClick={() => onRemove(id)}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}
