import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../ui/Button/Button';
import './Navbar.css';

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Simple title mapper for current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Overview';
    if (path.includes('/orders') && !path.includes('/new') && !path.includes('/rates')) return 'Shipment Orders';
    if (path.includes('/orders/new')) return 'Create New Order';
    if (path.includes('/rates')) return 'Rate Comparison & Courier Selection';
    if (path.includes('/orders/')) return 'Order Details';
    if (path.includes('/tracking')) return 'Internal Tracking Center';
    if (path.includes('/analytics')) return 'Logistics Analytics';
    if (path.includes('/webhooks')) return 'Webhook Simulation Studio';
    if (path.includes('/settings')) return 'Platform Settings';
    return 'Zippy Platform';
  };

  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button 
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
        <h1 className="page-title">{getPageTitle()}</h1>
      </div>

      <div className="navbar-right">
        <div className="env-badges">
          <span className="env-badge api">API 8080</span>
          <span className="env-badge courier">Mock 8081</span>
        </div>

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
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>

        {!location.pathname.endsWith('/orders/new') && (
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => navigate('/merchant/orders/new')}
          >
            + New Order
          </Button>
        )}
      </div>
    </header>
  );
}
