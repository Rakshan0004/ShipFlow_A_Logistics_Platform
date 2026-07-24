import React from 'react';
import Card from '../../ui/Card/Card';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import { formatDate } from '../../../utils/formatters';

export default function PublicStatusTimeline({ trackingData }) {
  if (!trackingData) return null;

  const { trackingNumber, status, carrierName, originCity, destinationCity, estimatedDelivery, events = [] } = trackingData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview Card */}
      <Card title={`Parcel Status: ${trackingNumber}`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Current Status</div>
            <div style={{ marginTop: '0.2rem' }}><StatusBadge status={status} /></div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Carrier Partner</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-500)' }}>{carrierName || 'Express Courier'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Route</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{originCity || 'Origin'} → {destinationCity || 'Destination'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Estimated Delivery</div>
            <div style={{ fontSize: '0.95rem', color: 'var(--success)', fontWeight: 600 }}>{estimatedDelivery || '2-3 Business Days'}</div>
          </div>
        </div>
      </Card>

      {/* Public Event History */}
      <Card title="Detailed Milestone Updates">
        {events.length === 0 ? (
          <p style={{ color: 'var(--neutral-500)' }}>No tracking scan updates recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {events.map((ev, i) => (
              <div 
                key={i} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '1rem',
                  paddingBottom: i === events.length - 1 ? 0 : '1rem',
                  borderBottom: i === events.length - 1 ? 'none' : '1px solid var(--neutral-200)'
                }}
              >
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: i === 0 ? 'var(--primary-500)' : 'var(--neutral-400)',
                  marginTop: '0.3rem'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--neutral-950)' }}>
                    {ev.description || ev.status}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
                    Location: {ev.location || 'Hub Processing Center'} • {formatDate(ev.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
