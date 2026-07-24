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
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Merchant Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Courier</th>
                  <th>Destination</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.orderId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                      {order.orderId}
                    </td>
                    <td>{order.merchantOrderId}</td>
                    <td>{order.customer?.name || order.customerName}</td>
                    <td>
                      <span className={`status-badge status-${order.orderStatus?.toLowerCase().replace(/_/g, '-')}`}>
                        {order.orderStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {order.selectedCarrierCode ? (
                        <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                          {order.selectedCarrierCode}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--neutral-500)' }}>Not selected</span>
                      )}
                    </td>
                    <td>{order.deliveryAddress?.city || order.deliveryCity}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
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
