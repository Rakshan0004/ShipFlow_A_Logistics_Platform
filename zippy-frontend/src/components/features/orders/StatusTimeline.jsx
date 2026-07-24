import React from 'react';
import Card from '../../ui/Card/Card';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import { formatDate } from '../../../utils/formatters';

const STATUS_STEPS = [
  { key: 'ORDER_CREATED', label: 'Order Created', icon: '📝' },
  { key: 'CARRIER_SELECTED', label: 'Courier Selected', icon: '🎯' },
  { key: 'SHIPMENT_CREATED', label: 'Shipment Booked', icon: '📦' },
  { key: 'PICKED_UP', label: 'Picked Up', icon: '🚚' },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: '🚀' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🏃' },
  { key: 'DELIVERED', label: 'Delivered', icon: '✅' }
];

export default function StatusTimeline({ currentStatus = 'ORDER_CREATED', events = [] }) {
  const getStepState = (stepKey) => {
    if (currentStatus === 'CANCELLED' || currentStatus === 'RTO' || currentStatus === 'DELIVERY_FAILED') {
      if (stepKey === currentStatus) return 'failed';
    }

    const currentIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);
    const stepIndex = STATUS_STEPS.findIndex(s => s.key === stepKey);

    if (stepIndex === -1) return 'future';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'future';
  };

  return (
    <Card title="Tracking Progress & Timeline">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Visual Milestone Stepper */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflowX: 'auto',
          padding: '1rem 0'
        }}>
          {STATUS_STEPS.map((step, idx) => {
            const state = getStepState(step.key);
            return (
              <div 
                key={step.key} 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '100px',
                  zIndex: 2
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  backgroundColor: 
                    state === 'completed' ? 'var(--success)' :
                    state === 'active' ? 'var(--primary-500)' :
                    state === 'failed' ? 'var(--error)' : 'var(--neutral-200)',
                  color: state === 'future' ? 'var(--neutral-500)' : '#ffffff',
                  boxShadow: state === 'active' ? '0 0 12px rgba(14, 165, 233, 0.5)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {state === 'completed' ? '✓' : step.icon}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: state === 'active' ? 700 : 500,
                  color: state === 'active' ? 'var(--primary-500)' : 'var(--neutral-600)',
                  marginTop: '0.5rem',
                  textAlign: 'center'
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Detailed Event Log */}
        {events && events.length > 0 && (
          <div style={{ borderTop: '1px solid var(--neutral-200)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--neutral-700)' }}>
              Status History Logs:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {events.map((ev, i) => (
                <div 
                  key={i} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--neutral-100)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <StatusBadge status={ev.status || ev.orderStatus} />
                    <span style={{ color: 'var(--neutral-700)' }}>{ev.location || ev.description || 'Status updated'}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>
                    {formatDate(ev.timestamp || ev.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
