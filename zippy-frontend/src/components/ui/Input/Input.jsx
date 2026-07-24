import React from 'react';
import './Input.css';

export function Input({
  label,
  error,
  disabled = false,
  className = '',
  type = 'text',
  id,
  required = false,
  ...props
}) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={`input ${error ? 'input-error' : ''} ${disabled ? 'input-disabled' : ''}`}
        disabled={disabled}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="input-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default Input;
