import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Table from '../../ui/Table/Table';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import Button from '../../ui/Button/Button';
import { formatDate } from '../../../utils/formatters';
import { CARRIER_NAMES } from '../../../utils/constants';

export default function ActiveShipmentsTable({ shipments = [], loading }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const basePath = isAdminRoute ? '/admin' : '/merchant';

  const columns = [
    { 
      key: 'orderId', 
      header: 'Order ID',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
          {val}
        </span>
      )
    },
    { 
      key: 'trackingNumber', 
      header: 'AWB Tracking #',
      render: (val, row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {val || row.awbNumber || 'PENDING'}
        </span>
      )
    },
    { 
      key: 'carrierCode', 
      header: 'Courier',
      render: (val) => CARRIER_NAMES[val] || val || 'Unassigned'
    },
    { 
      key: 'destination', 
      header: 'Destination',
      render: (_, row) => row.deliveryAddress?.city || row.deliveryCity || 'N/A'
    },
    { 
      key: 'orderStatus', 
      header: 'Current Status',
      render: (val, row) => <StatusBadge status={val || row.currentStatus} />
    },
    { 
      key: 'updatedAt', 
      header: 'Last Update',
      render: (val, row) => formatDate(val || row.createdAt)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`${basePath}/orders/${row.orderId}`);
          }}
        >
          Details →
        </Button>
      )
    }
  ];

  return (
    <Table 
      columns={columns} 
      data={shipments} 
      loading={loading}
      onRowClick={(row) => navigate(`${basePath}/orders/${row.orderId}`)}
      emptyMessage="No active in-transit shipments at the moment."
    />
  );
}
