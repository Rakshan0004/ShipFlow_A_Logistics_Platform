import React from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../ui/Table/Table';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import Button from '../../ui/Button/Button';
import { formatDate } from '../../../utils/formatters';

export default function RecentOrdersTable({ orders = [], loading }) {
  const navigate = useNavigate();

  const columns = [
    { 
      key: 'orderId', 
      header: 'Order ID',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
          {val}
        </span>
      )
    },
    { key: 'merchantOrderId', header: 'Merchant Ref' },
    { 
      key: 'customerName', 
      header: 'Customer',
      render: (_, row) => row.customer?.name || row.customerName || 'N/A'
    },
    { 
      key: 'deliveryCity', 
      header: 'Destination',
      render: (_, row) => row.deliveryAddress?.city || row.deliveryCity || 'N/A'
    },
    { 
      key: 'orderStatus', 
      header: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    { 
      key: 'createdAt', 
      header: 'Created',
      render: (val) => formatDate(val)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <Button 
          variant="link" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/admin/orders/${row.orderId}`);
          }}
        >
          View Details
        </Button>
      )
    }
  ];

  return (
    <Table 
      columns={columns} 
      data={orders} 
      loading={loading}
      onRowClick={(row) => navigate(`/admin/orders/${row.orderId}`)}
      emptyMessage="No recent orders found."
    />
  );
}
