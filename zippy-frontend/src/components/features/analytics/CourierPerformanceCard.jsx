import React from 'react';
import Card from '../../ui/Card/Card';
import { CARRIER_NAMES } from '../../../utils/constants';

export default function CourierPerformanceCard({ performanceData = [], loading }) {
  return (
    <Card title="Courier Performance & SLA Comparison">
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
          Loading courier performance metrics...
        </div>
      ) : performanceData.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
          No courier performance metrics available.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--neutral-200)', color: 'var(--neutral-500)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem' }}>Courier Partner</th>
                <th style={{ padding: '0.75rem' }}>Total Volume</th>
                <th style={{ padding: '0.75rem' }}>On-Time SLA %</th>
                <th style={{ padding: '0.75rem' }}>Avg Delivery Speed</th>
                <th style={{ padding: '0.75rem' }}>RTO Rate</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: 'var(--neutral-950)' }}>
                    {CARRIER_NAMES[item.carrierCode] || item.carrierCode}
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>{item.totalShipments} parcels</td>
                  <td style={{ padding: '0.85rem 0.75rem' }}>
                    <span style={{ 
                      fontWeight: 700, 
                      color: item.onTimePercentage >= 90 ? 'var(--success)' : 'var(--warning)',
                      background: item.onTimePercentage >= 90 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)'
                    }}>
                      {item.onTimePercentage}%
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>{item.avgDeliveryDays} Days</td>
                  <td style={{ padding: '0.85rem 0.75rem', color: item.rtoPercentage > 5 ? 'var(--error)' : 'var(--neutral-600)' }}>
                    {item.rtoPercentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
