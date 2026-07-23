import React from 'react';

export default function Navbar({ activeTab, setActiveTab, activeOrder }) {
  return (
    <header className="navbar">
      <div className="brand">
        <div className="brand-icon">Z</div>
        <div>
          <span className="brand-title">Zippy Logistics</span>
          <span className="brand-tag">Aggregator Platform</span>
        </div>
      </div>

      <nav className="nav-links">
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
          3. Shipment & Tracking
        </button>
        <button
          className={`nav-btn ${activeTab === 'simulation' ? 'active' : ''}`}
          onClick={() => setActiveTab('simulation')}
        >
          ⚙ Simulation & Webhooks
        </button>
      </nav>
    </header>
  );
}
