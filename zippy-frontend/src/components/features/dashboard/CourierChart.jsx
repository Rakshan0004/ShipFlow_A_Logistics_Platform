import React from 'react';
import Card from '../../ui/Card/Card';
import { CARRIER_NAMES } from '../../../utils/constants';

export default function CourierChart({ breakdown = {}, loading }) {
  const carriers = Object.entries(breakdown);
  const total = carriers.reduce((sum, [_, count]) => sum + count, 0) || 1;

  const getCarrierColor = (code) => {
    switch (code?.toUpperCase()) {
      case 'FASTSHIP': return '#0ea5e9';
      case 'QUICKEXPRESS': return '#10b981';
      case 'RELIABLE': return '#8b5cf6';
      default: return '#f59e0b';
    }
  };

  return (
    <Card title="Courier Distribution" headerExtra="Real-time aggregation">
      {loading ? (
        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="stats-skeleton shimmer" style={{ width: '100%', height: '120px' }} />
        </div>
      ) : carriers.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--neutral-500)', padding: '2rem 0' }}>
          No courier distribution data available yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Visual Bar representation */}
          <div style={{ height: '16px', display: 'flex', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--neutral-200)' }}>
            {carriers.map(([code, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div 
                  key={code}
                  title={`${CARRIER_NAMES[code] || code}: ${count} shipments (${pct}%)`}
                  style={{
                    width: `${pct}%`,
                    backgroundColor: getCarrierColor(code),
                    transition: 'width 0.5s ease'
                  }}
                />
              );
            })}
          </div>

          {/* Legend Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
            {carriers.map(([code, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: getCarrierColor(code) }} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-900)' }}>
                      {CARRIER_NAMES[code] || code}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                      {count} orders ({pct}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
