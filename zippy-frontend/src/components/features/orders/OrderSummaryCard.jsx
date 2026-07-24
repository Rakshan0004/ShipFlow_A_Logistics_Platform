import React from 'react';
import Card from '../../ui/Card/Card';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import { formatDate, formatCurrency, formatWeight } from '../../../utils/formatters';

export default function OrderSummaryCard({ order }) {
  if (!order) return null;

  return (
    <Card title="Order Summary">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Zippy Order ID</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-500)' }}>{order.orderId}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Merchant Ref</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--neutral-900)' }}>{order.merchantOrderId}</div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Current Status</div>
          <div style={{ marginTop: '0.2rem' }}><StatusBadge status={order.orderStatus} /></div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Payment Type</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--neutral-900)' }}>
            {order.paymentType} {order.paymentType === 'COD' ? `(${formatCurrency(order.codAmount)})` : ''}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Package Weight</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--neutral-900)' }}>
            {formatWeight(order.package?.weightGrams || order.weightGrams)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', textTransform: 'uppercase' }}>Created Date</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--neutral-800)' }}>
            {formatDate(order.createdAt)}
          </div>
        </div>
      </div>
    </Card>
  );
}
