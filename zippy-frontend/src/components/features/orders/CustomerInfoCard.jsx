import React from 'react';
import Card from '../../ui/Card/Card';

export default function CustomerInfoCard({ customer }) {
  if (!customer) return null;

  return (
    <Card title="Customer Information">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Full Name</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--neutral-950)' }}>{customer.name}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Phone Number</div>
          <div style={{ fontSize: '0.92rem', color: 'var(--neutral-800)' }}>📞 {customer.phone}</div>
        </div>

        {customer.email && (
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Email Address</div>
            <div style={{ fontSize: '0.92rem', color: 'var(--neutral-800)' }}>✉️ {customer.email}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
