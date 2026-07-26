import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import SearchInput from '../../components/ui/Input/SearchInput';
import Select from '../../components/ui/Select/Select';
import Table from '../../components/ui/Table/Table';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import Pagination from '../../components/ui/Pagination/Pagination';
import { ordersApi } from '../../api/endpoints/orders';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ORDER_STATUSES } from '../../utils/constants';

export default function OrderList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAll();
      const list = res.data || res;
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Failed to fetch orders from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter and sort logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        order.orderId?.toLowerCase().includes(query) ||
        order.merchantOrderId?.toLowerCase().includes(query) ||
        order.customer?.name?.toLowerCase().includes(query) ||
        order.customer?.phone?.includes(query);

      // Status match
      const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'customerName') {
        aVal = a.customer?.name || '';
        bVal = b.customer?.name || '';
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, searchQuery, statusFilter, sortField, sortDirection]);

  // Paginated subset
  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const columns = [
    { 
      key: 'orderId', 
      header: 'Order ID',
      sortable: true,
      render: (val, row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-500)', cursor: 'pointer' }} onClick={() => navigate(`/admin/orders/${val}`)}>
          {val}
        </span>
      )
    },
    { key: 'merchantOrderId', header: 'Merchant Ref', sortable: true },
    { 
      key: 'customerName', 
      header: 'Customer',
      render: (_, row) => row.customer?.name || 'N/A'
    },
    { 
      key: 'payment', 
      header: 'Payment',
      render: (_, row) => `${row.paymentType || 'COD'} (${formatCurrency(row.codAmount || 0)})`
    },
    { 
      key: 'orderStatus', 
      header: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />
    },
    { 
      key: 'createdAt', 
      header: 'Created',
      sortable: true,
      render: (val) => formatDate(val)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/admin/orders/${row.orderId}`)}
          >
            View
          </Button>
          {row.orderStatus === 'ORDER_CREATED' && (
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => navigate(`/admin/orders/${row.orderId}/rates`)}
            >
              Rates →
            </Button>
          )}
        </div>
      )
    }
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    ...Object.entries(ORDER_STATUSES).map(([key, label]) => ({
      value: key,
      label
    }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Controls Bar */}
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          flexWrap: 'wrap', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0' }}>All Orders (Admin)</h1>
            <p style={{ color: 'var(--neutral-600)', margin: 0, fontSize: '0.9rem' }}>
              View and manage orders from all merchants
            </p>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '280px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <SearchInput 
                value={searchQuery} 
                onChange={(val) => { setSearchQuery(val); setCurrentPage(1); }} 
                placeholder="Search Order ID, Ref, Customer..." 
              />
            </div>
            <div style={{ width: '180px' }}>
              <Select 
                value={statusFilter}
                onChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}
                options={statusOptions}
              />
            </div>
          </div>

          <Button variant="primary" onClick={() => navigate('/merchant/orders/new')}>
            + Create Order
          </Button>
        </div>
      </Card>

      {/* Orders Table */}
      <Card title={`All Orders (${filteredOrders.length})`}>
        <Table 
          columns={columns} 
          data={paginatedOrders} 
          loading={loading}
          sortColumn={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage={
            searchQuery || statusFilter !== 'ALL' 
              ? 'No orders found matching search filters.'
              : 'No orders available yet. Create your first order to get started!'
          }
        />

        {totalPages > 1 && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
