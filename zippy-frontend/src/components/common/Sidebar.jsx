import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation();

  const merchantItems = [
    { path: '/merchant/dashboard', label: 'My Dashboard', icon: '📊' },
    { path: '/merchant/orders/new', label: 'Create Order', icon: '➕' },
    { path: '/merchant/orders', label: 'My Orders', icon: '📦' },
    { path: '/merchant/tracking', label: 'Track Shipment', icon: '🔍' },
  ];

  const adminItems = [
    { path: '/admin/dashboard', label: 'System Dashboard', icon: '📈' },
    { path: '/admin/orders', label: 'All Orders', icon: '📋' },
    { path: '/admin/analytics', label: 'Analytics', icon: '📊' },
    { path: '/admin/webhooks', label: 'Webhook Studio', icon: '⚡' },
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
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
          <NavLink to="/merchant/dashboard" className="sidebar-brand" onClick={() => setIsOpen(false)}>
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
          {/* Merchant Section */}
          <div className="nav-section-label">📦 MERCHANT PORTAL</div>
          {merchantItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/merchant/orders' && location.pathname.startsWith('/merchant/orders') && location.pathname !== '/merchant/orders/new');
            
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

          {/* Admin Section */}
          <div className="nav-section-label" style={{ marginTop: '2rem' }}>👤 ADMIN PANEL</div>
          {adminItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === '/admin/orders' && location.pathname.startsWith('/admin/orders'));
            
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
            to="/tracking/public"
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
