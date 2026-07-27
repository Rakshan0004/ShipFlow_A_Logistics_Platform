import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Footer from '../common/Footer';
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
            <a 
              href="https://github.com/Rakshan0004/ShipFlow_A_Logistics_Platform" 
              target="_blank" 
              rel="noopener noreferrer"
              className="github-nav-btn"
              title="View GitHub Repository"
              aria-label="GitHub Repository"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>

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

      <Footer />
    </div>
  );
}
