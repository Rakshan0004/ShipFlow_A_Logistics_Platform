import React from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../ui/Table/Table';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import Button from '../../ui/Button/Button';
import { formatDate } from '../../../utils/formatters';

export default function RecentOrdersTable({ orders = [], loading }) {
  const navigate = useNavigate();

  const columns = [
    { key: 'orderId', header: 'Order ID' },
    { key: 'merchantOrderId', header: 'Merchant Ref' },
    { key: 'customerName', header: 'Customer' },
    { key: 'deliveryCity', header: 'Delivery City' },
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
      header: 'Action',
      render: (_, row) => (
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/orders/${row.orderId}`);
          }}
        >
          View →
        </Button>
      )
    }
  ];

  return (
    <Table 
      columns={columns} 
      data={orders} 
      loading={loading}
      onRowClick={(row) => navigate(`/orders/${row.orderId}`)}
      emptyMessage="No recent orders found."
    />
  );
}
