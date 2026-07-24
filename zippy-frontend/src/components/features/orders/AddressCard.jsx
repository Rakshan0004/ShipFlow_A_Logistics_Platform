import React from 'react';
import Card from '../../ui/Card/Card';

export default function AddressCard({ pickupAddress, deliveryAddress }) {
  return (
    <Card title="Pickup & Delivery Route">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'var(--neutral-100)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-500)', marginBottom: '0.4rem' }}>
            📍 PICKUP ADDRESS
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--neutral-900)', fontWeight: 600 }}>
            {pickupAddress?.addressLine1 || 'Warehouse A'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>
            {pickupAddress?.city}, {pickupAddress?.state} - {pickupAddress?.pincode}
          </div>
        </div>

        <div style={{ background: 'var(--neutral-100)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.4rem' }}>
            🏁 DELIVERY ADDRESS
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--neutral-900)', fontWeight: 600 }}>
            {deliveryAddress?.addressLine1 || 'Destination Address'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>
            {deliveryAddress?.city}, {deliveryAddress?.state} - {deliveryAddress?.pincode}
          </div>
        </div>
      </div>
    </Card>
  );
}
