import React, { useState, useEffect } from 'react';
import './SearchInput.css';

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounce = 500,
  className = '',
  ...props
}) {
  const [internalValue, setInternalValue] = useState(value || '');

  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange && internalValue !== value) {
        onChange(internalValue);
      }
    }, debounce);

    return () => clearTimeout(timer);
  }, [internalValue, debounce, onChange, value]);

  const handleClear = () => {
    setInternalValue('');
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className={`search-input-wrapper ${className}`}>
      <span className="search-icon" aria-hidden="true">
        🔍
      </span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        aria-label="Search"
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={handleClear}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchInput;
