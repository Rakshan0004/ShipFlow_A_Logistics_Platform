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
