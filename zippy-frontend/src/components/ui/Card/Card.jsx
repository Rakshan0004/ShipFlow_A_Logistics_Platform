import React from 'react';
import './Card.css';

export function Card({
  title,
  headerExtra,
  footer,
  children,
  className = '',
  ...props
}) {
  return (
    <div className={`card ${className}`} {...props}>
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          {headerExtra && <div className="card-header-extra">{headerExtra}</div>}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
}

export default Card;
