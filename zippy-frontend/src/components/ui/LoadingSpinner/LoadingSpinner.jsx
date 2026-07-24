import React from 'react';
import './LoadingSpinner.css';

export function LoadingSpinner({ 
  size = 'md', // sm, md, lg
  className = '' 
}) {
  return (
    <div 
      className={`loading-spinner loading-spinner-${size} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <svg className="spinner" viewBox="0 0 50 50">
        <circle 
          className="spinner-path" 
          cx="25" 
          cy="25" 
          r="20" 
          fill="none" 
          strokeWidth="4"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default LoadingSpinner;
