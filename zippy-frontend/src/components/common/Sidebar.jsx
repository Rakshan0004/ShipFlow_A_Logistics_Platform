import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/orders', label: 'All Orders', icon: '📦' },
    { path: '/orders/new', label: 'Create Order', icon: '➕' },
    { path: '/tracking', label: 'Tracking Center', icon: '📍' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/webhook-studio', label: 'Webhook Studio', icon: '⚡' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-brand" onClick={() => setIsOpen(false)}>
            <span className="brand-logo">L</span>
            <div className="brand-text">
              <span className="brand-title">LOGISTICS</span>
              <span className="brand-sub">Platform Aggregator</span>
            </div>
          </NavLink>
          <button 
            className="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">MAIN NAVIGATION</div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/orders' && location.pathname.startsWith('/orders') && location.pathname !== '/orders/new');
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive: linkActive }) =>
                  `sidebar-link ${linkActive || isActive ? 'active' : ''}`
                }
                onClick={() => setIsOpen(false)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            );
          })}

          <div className="nav-section-label" style={{ marginTop: '1.5rem' }}>PUBLIC TOOLS</div>
          <NavLink
            to="/tracking/public/ZPY-SAMPLE-101"
            className="sidebar-link public-link"
            onClick={() => setIsOpen(false)}
          >
            <span className="sidebar-icon">🔍</span>
            <span className="sidebar-label">Public Tracking Portal</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-indicator online"></span>
            <div className="status-info">
              <div className="status-title">Backend v1.0</div>
              <div className="status-sub">Active (Port 8080)</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
