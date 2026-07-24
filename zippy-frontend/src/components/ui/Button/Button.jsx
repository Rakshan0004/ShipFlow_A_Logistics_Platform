import React from 'react';
import './Button.css';

export function Button({ 
  variant = 'primary',    // primary, secondary, outline, ghost, danger
  size = 'md',            // sm, md, lg
  loading = false,
  disabled = false,
  icon,
  children,
  className = '',
  type = 'button',
  ...props 
}) {
  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const loadingClass = loading ? 'btn-loading' : '';
  const disabledClass = disabled || loading ? 'btn-disabled' : '';
  
  const allClasses = [
    baseClasses,
    variantClass,
    sizeClass,
    loadingClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={allClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner">
          <svg className="spinner-icon" viewBox="0 0 24 24">
            <circle 
              className="spinner-circle" 
              cx="12" 
              cy="12" 
              r="10" 
              fill="none" 
              strokeWidth="3"
            />
          </svg>
        </span>
      )}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
}

export default Button;
