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
  { key: 'DELIVERED', label: 'Delivered', icon: '🏁' }
];

const normalizeStatusKey = (status) => {
  if (!status) return 'ORDER_CREATED';
  const str = String(status).toUpperCase();
  if (str.includes('DELIVERED')) return 'DELIVERED';
  if (str.includes('OUT_FOR_DELIVERY') || str.includes('DISPATCH')) return 'OUT_FOR_DELIVERY';
  if (str.includes('IN_TRANSIT') || str.includes('TRANSIT')) return 'IN_TRANSIT';
  if (str.includes('PICKED_UP') || str.includes('PICKUP')) return 'PICKED_UP';
  if (str.includes('SHIPMENT_CREATED') || str.includes('BOOKED') || str.includes('MANIFEST')) return 'SHIPMENT_CREATED';
  if (str.includes('CARRIER_SELECTED') || str.includes('COURIER_SELECTED')) return 'CARRIER_SELECTED';
  if (str.includes('ORDER_CREATED') || str.includes('CREATED')) return 'ORDER_CREATED';
  return status;
};

export default function StatusTimeline({ currentStatus = 'ORDER_CREATED', events = [], order = null }) {
  // Determine effective status considering order data signals
  let effectiveStatusKey = normalizeStatusKey(currentStatus);

  if (order) {
    if ((order.awbNumber || order.trackingNumber) && ['ORDER_CREATED', 'CARRIER_SELECTED'].includes(effectiveStatusKey)) {
      effectiveStatusKey = 'SHIPMENT_CREATED';
    } else if ((order.selectedCarrierCode || order.carrierCode) && effectiveStatusKey === 'ORDER_CREATED') {
      effectiveStatusKey = 'CARRIER_SELECTED';
    }
  }

  const currentIndex = STATUS_STEPS.findIndex(s => s.key === effectiveStatusKey);

  const getStepState = (stepKey) => {
    if (effectiveStatusKey === 'CANCELLED' || effectiveStatusKey === 'RTO' || effectiveStatusKey === 'DELIVERY_FAILED') {
      if (stepKey === effectiveStatusKey) return 'failed';
    }

    const stepIndex = STATUS_STEPS.findIndex(s => s.key === stepKey);

    if (stepIndex === -1) return 'future';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'future';
  };

  const progressPercent = currentIndex < 0 ? 0 : (currentIndex / (STATUS_STEPS.length - 1)) * 100;

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
          padding: '1.25rem 0'
        }}>
          {/* Progress Connecting Track Line */}
          <div style={{
            position: 'absolute',
            top: '32px',
            left: '50px',
            right: '50px',
            height: '4px',
            background: 'var(--neutral-300)',
            opacity: 0.3,
            zIndex: 1,
            borderRadius: '2px'
          }} />

          {/* Filled Progress Bar */}
          <div style={{
            position: 'absolute',
            top: '32px',
            left: '50px',
            width: `calc(${progressPercent}% * (1 - 100px / 100%))`,
            height: '4px',
            background: 'linear-gradient(90deg, #10b981 0%, #0ea5e9 100%)',
            zIndex: 1,
            borderRadius: '2px',
            transition: 'width 0.4s ease'
          }} />

          {STATUS_STEPS.map((step) => {
            const state = getStepState(step.key);
            const isCompleted = state === 'completed';
            const isActive = state === 'active';
            const isFailed = state === 'failed';
            const isFuture = state === 'future';

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
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  backgroundColor: 
                    isCompleted ? 'var(--success)' :
                    isActive ? 'var(--primary-500)' :
                    isFailed ? 'var(--error)' : 'rgba(156, 163, 175, 0.15)',
                  color: isFuture ? 'var(--neutral-400)' : '#ffffff',
                  border: isActive 
                    ? '3px solid var(--primary-300)' 
                    : isFuture 
                      ? '2px solid rgba(156, 163, 175, 0.25)' 
                      : 'none',
                  boxShadow: isActive ? '0 0 16px rgba(14, 165, 233, 0.6)' : isCompleted ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none',
                  opacity: isFuture ? 0.45 : 1,
                  filter: isFuture ? 'grayscale(80%)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {isCompleted ? '✓' : step.icon}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : isCompleted ? 600 : 400,
                  color: isActive 
                    ? 'var(--primary-500)' 
                    : isCompleted 
                      ? 'var(--success)' 
                      : 'var(--neutral-500)',
                  opacity: isFuture ? 0.45 : 1,
                  marginTop: '0.6rem',
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
