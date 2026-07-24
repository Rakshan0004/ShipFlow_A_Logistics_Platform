import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import './PublicLayout.css';

export default function PublicLayout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header-container">
          <Link to="/" className="public-brand">
            <span className="brand-logo">Z</span>
            <div className="brand-text">
              <span className="brand-title">ZIPPY</span>
              <span className="brand-sub">Parcel Tracking</span>
            </div>
          </Link>

          <div className="public-actions">
            <button 
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <Link to="/dashboard" className="merchant-link">
              Merchant Login →
            </Link>
          </div>
        </div>
      </header>

      <main className="public-main">
        <div className="public-container">
          <Outlet />
        </div>
      </main>

      <footer className="public-footer">
        <p>© {new Date().getFullYear()} Zippy Logistics Network. Multi-carrier real-time parcel tracking engine.</p>
      </footer>
    </div>
  );
}
