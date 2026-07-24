import React from 'react';
import './StatusBadge.css';

export function StatusBadge({ status, className = '' }) {
  const statusConfig = {
    ORDER_CREATED: { label: 'Created', color: 'blue' },
    CARRIER_SELECTED: { label: 'Carrier Selected', color: 'purple' },
    SHIPMENT_CREATED: { label: 'Booked', color: 'cyan' },
    PICKED_UP: { label: 'Picked Up', color: 'yellow' },
    IN_TRANSIT: { label: 'In Transit', color: 'orange' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'amber' },
    DELIVERED: { label: 'Delivered', color: 'green' },
    DELIVERY_FAILED: { label: 'Failed', color: 'red' },
    RTO: { label: 'RTO', color: 'gray' },
    CANCELLED: { label: 'Cancelled', color: 'gray' }
  };

  const config = statusConfig[status] || { label: status, color: 'gray' };

  return (
    <span 
      className={`status-badge status-badge-${config.color} ${className}`}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;
