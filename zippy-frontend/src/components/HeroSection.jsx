import React, { useState } from 'react';

export default function HeroSection({ onStartOrder, onFillSampleAndSubmit }) {
  const [showAuthInfo, setShowAuthInfo] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
      {/* Hero Main Banner */}
      <div className="card" style={{
        background: '#0a0a0a',
        borderColor: '#262626',
        padding: '2.5rem 2rem',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '850px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span className="badge badge-cheapest">⚡ MULTI-COURIER AGGREGATOR ENGINE</span>
            <span className="badge badge-status" style={{ cursor: 'pointer' }} onClick={() => setShowAuthInfo(!showAuthInfo)}>
              ℹ️ Why No Login / Auth? {showAuthInfo ? '▲ Hide' : '▼ Read Why'}
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', color: '#ffffff' }}>
            Smart Multi-Courier Rate Aggregation & Real-Time Logistics Tracking
          </h1>

          <p style={{ color: '#d4d4d4', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Zippy connects merchants to <strong>FastShip</strong>, <strong>QuickExpress</strong>, and <strong>ReliableCourier</strong>. Experience parallel rate fetching, anti-price-tampering selection, 7-row status normalization, and idempotent webhook processing.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={onFillSampleAndSubmit} style={{ padding: '0.9rem 1.75rem', fontSize: '1rem' }}>
              ⚡ Run Quick Demo Order Flow →
            </button>
            <button className="btn-secondary" onClick={onStartOrder} style={{ padding: '0.9rem 1.5rem', fontSize: '1rem' }}>
              📝 Custom Order Form
            </button>
          </div>
        </div>

        {/* Floating Architecture Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #262626'
        }}>
          <div style={{ background: '#000000', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #262626' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🚀 5s Timeout</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Parallel Fetching</div>
            <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Asynchronous Netty WebClient calls to all couriers</div>
          </div>

          <div style={{ background: '#000000', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #262626' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🔒 Anti-Tampering</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Frozen Rate Guarantee</div>
            <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Verifies quoted amount before creating shipment</div>
          </div>

          <div style={{ background: '#000000', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #262626' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🔄 Idempotent</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>7-Row Webhook Mapping</div>
            <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>PostgreSQL partial index prevents duplicate events</div>
          </div>
        </div>
      </div>

      {/* Why No Auth / JWT Explanation Modal Banner */}
      {showAuthInfo && (
        <div className="card" style={{ background: '#000000', borderColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <h3 style={{ color: '#ffffff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💡 Architectural Note: Why User Login / JWT Auth is Omitted by Design
            </h3>
            <button className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }} onClick={() => setShowAuthInfo(false)}>
              Close ✕
            </button>
          </div>
          <p style={{ color: '#d4d4d4', fontSize: '0.9rem', lineHeight: 1.6 }}>
            In evaluation and assignment mode, requiring user registration and JWT auth adds unnecessary testing friction for reviewers. By omitting user authentication, you can directly evaluate the core multi-courier logistics engine — <strong>rate aggregation algorithms, partial failure handling, database transaction locks, 7-row status normalization, and webhook idempotency</strong> — without needing to manage session tokens or register test accounts.
          </p>
        </div>
      )}
    </div>
  );
}
