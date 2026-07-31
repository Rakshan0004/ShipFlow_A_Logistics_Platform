import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner/LoadingSpinner';
import { ordersApi } from '../../api/endpoints/orders';
import { useToast } from '../../contexts/ToastContext';

export default function MerchantOrderList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAll();
      const data = res.data || res || [];
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['ORDER_CREATED', 'CARRIER_SELECTED', 'SHIPMENT_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(order.orderStatus);
    if (filter === 'delivered') return order.orderStatus === 'DELIVERED';
    return true;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size="lg" label="Loading your orders..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>My Orders</h1>
          <p style={{ color: 'var(--neutral-600)', margin: 0 }}>
            Manage and track all your shipments
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/merchant/orders/new')}>
          + Create New Order
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button 
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Orders ({orders.length})
        </Button>
        <Button 
          variant={filter === 'active' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active ({orders.filter(o => ['ORDER_CREATED', 'CARRIER_SELECTED', 'SHIPMENT_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length})
        </Button>
        <Button 
          variant={filter === 'delivered' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('delivered')}
        >
          Delivered ({orders.filter(o => o.orderStatus === 'DELIVERED').length})
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-600)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>No orders found</h3>
            <p style={{ marginBottom: '1.5rem' }}>
              {filter === 'all' 
                ? "You haven't created any orders yet. Start by creating your first order!"
                : `No ${filter} orders found. Try a different filter.`}
            </p>
            {filter === 'all' && (
              <Button variant="primary" onClick={() => navigate('/merchant/orders/new')}>
                Create First Order
              </Button>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--neutral-200)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-700)', whiteSpace: 'nowrap' }}>Order ID</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-700)', whiteSpace: 'nowrap' }}>Merchant Ref</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-700)' }}>Customer</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-700)' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-700)' }}>Payment</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-700)' }}>Courier</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-700)' }}>Destination</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-700)' }}>Created</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600, color: 'var(--neutral-700)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.orderId} style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--neutral-900)', whiteSpace: 'nowrap' }}>
                      {order.orderId}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--neutral-800)' }}>
                      {order.merchantOrderId}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--neutral-800)' }}>
                      {order.customer?.name || order.customerName || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`status-badge status-${order.orderStatus?.toLowerCase().replace(/_/g, '-')}`}>
                        {order.orderStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.18rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: order.paymentType === 'COD' ? 'rgba(245,158,11,0.12)' : 'rgba(14,165,233,0.12)',
                        color: order.paymentType === 'COD' ? '#d97706' : '#0284c7',
                      }}>
                        {order.paymentType || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {order.selectedCarrierCode ? (
                        <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                          {order.selectedCarrierCode}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--neutral-500)' }}>Not selected</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--neutral-800)' }}>
                      {order.deliveryAddress?.city || order.deliveryCity || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--neutral-600)', fontSize: '0.85rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                        <Button 
                          variant="link" 
                          size="sm"
                          onClick={() => navigate(`/merchant/orders/${order.orderId}`)}
                        >
                          View
                        </Button>
                        {order.orderStatus === 'ORDER_CREATED' && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => navigate(`/merchant/orders/${order.orderId}/rates`)}
                          >
                            Select Courier
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
