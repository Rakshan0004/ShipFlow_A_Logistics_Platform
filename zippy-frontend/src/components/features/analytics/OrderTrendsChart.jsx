import React from 'react';
import Card from '../../ui/Card/Card';

export default function OrderTrendsChart({ trendsData = [], loading }) {
  const maxVolume = trendsData.length > 0
    ? Math.max(...trendsData.map(d => d.volume)) || 100
    : 100;

  return (
    <Card title="Order Volume & Fulfillment Trends">
      {loading ? (
        <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-500)' }}>
          Loading trend visualizations...
        </div>
      ) : trendsData.length === 0 ? (
        <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-500)' }}>
          No trend data recorded for selected period.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            height: '200px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1.5rem',
            borderBottom: '2px solid var(--neutral-200)'
          }}>
            {trendsData.map((d, idx) => {
              const heightPct = Math.round((d.volume / maxVolume) * 100);
              return (
                <div 
                  key={idx} 
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-600)', marginBottom: '0.25rem' }}>
                    {d.volume}
                  </div>
                  <div 
                    title={`${d.date}: ${d.volume} orders (${d.delivered} delivered)`}
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${Math.max(heightPct, 8)}%`,
                      backgroundColor: 'var(--primary-500)',
                      borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                      transition: 'height 0.4s ease'
                    }}
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', marginTop: '0.4rem', textTransform: 'uppercase' }}>
                    {d.label || d.date}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--primary-500)', borderRadius: '2px' }} />
              <span>Total Shipment Orders</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
