import React from 'react';

export default function Navbar({ activeTab, setActiveTab, activeOrder }) {
  return (
    <header className="navbar">
      <div className="brand" onClick={() => setActiveTab('hero')} style={{ cursor: 'pointer' }}>
        <div className="brand-icon">Z</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="brand-title">Zippy</span>
            <span className="brand-tag">Logistics Aggregator</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Multi-Courier Rates & Webhook Engine</div>
        </div>
      </div>

      <nav className="nav-links">
        <button
          className={`nav-btn ${activeTab === 'hero' ? 'active' : ''}`}
          onClick={() => setActiveTab('hero')}
        >
          🏠 Overview
        </button>

        <button
          className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          1. Create Order
        </button>

        <button
          className={`nav-btn ${activeTab === 'rates' ? 'active' : ''}`}
          onClick={() => setActiveTab('rates')}
          disabled={!activeOrder}
        >
          2. Rate Comparison
        </button>

        <button
          className={`nav-btn ${activeTab === 'shipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('shipment')}
          disabled={!activeOrder}
        >
          3. Shipment Booking
        </button>

        <button
          className={`nav-btn ${activeTab === 'track' ? 'active' : ''}`}
          onClick={() => setActiveTab('track')}
        >
          🔍 Customer Track
        </button>

        <button
          className={`nav-btn ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
        >
          ⚙ Webhook Studio
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span className="badge badge-cheapest" style={{ fontSize: '0.75rem' }}>
          🟢 Backend API 8080
        </span>
        <span className="badge badge-fastest" style={{ fontSize: '0.75rem' }}>
          🟢 Mock Courier 8081
        </span>
      </div>
    </header>
  );
}
