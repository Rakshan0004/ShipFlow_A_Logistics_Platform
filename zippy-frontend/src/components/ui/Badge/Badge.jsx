import React from 'react';
import './Badge.css';

export function Badge({ 
  children, 
  variant = 'default', // default, primary, success, warning, error, info
  className = '' 
}) {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
