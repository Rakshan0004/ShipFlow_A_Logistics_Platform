import React from 'react';
import './Select.css';

export function Select({
  label,
  error,
  disabled = false,
  className = '',
  options = [],
  id,
  required = false,
  placeholder,
  ...props
}) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`select-wrapper ${className}`}>
      {label && (
        <label htmlFor={selectId} className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <div className="select-container">
        <select
          id={selectId}
          className={`select ${error ? 'select-error' : ''} ${disabled ? 'select-disabled' : ''}`}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={typeof option === 'object' ? option.value : option}
              value={typeof option === 'object' ? option.value : option}
              disabled={typeof option === 'object' ? option.disabled : false}
            >
              {typeof option === 'object' ? option.label : option}
            </option>
          ))}
        </select>
        <span className="select-arrow" aria-hidden="true">
          ▼
        </span>
      </div>
      {error && (
        <span id={`${selectId}-error`} className="select-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export default Select;
