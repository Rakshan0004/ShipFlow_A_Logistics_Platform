import React from 'react';
import './Skeleton.css';

export function Skeleton({ 
  width = '100%', 
  height = '20px', 
  variant = 'text', // text, circular, rectangular
  className = '' 
}) {
  const style = {
    width,
    height
  };

  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`}
      style={style}
      aria-label="Loading..."
      role="status"
    />
  );
}

export default Skeleton;
