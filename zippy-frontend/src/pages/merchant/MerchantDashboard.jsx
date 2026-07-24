import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner/LoadingSpinner';
import { ordersApi } from '../../api/endpoints/orders';
import { useToast } from '../../contexts/ToastContext';
import '../../styles/Dashboard.css';

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const fetchMerchantData = async () => {
    setLoading(true);
    try {
      // Get all orders (in real app, filter by merchant ID)
      const ordersRes = await ordersApi.getAll();
      const orders = ordersRes.data || ordersRes || [];

      // Calculate merchant stats
      const totalOrders = orders.length;
      const activeShipments = orders.filter(o => 
        ['CARRIER_SELECTED', 'SHIPMENT_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
      ).length;
      
      const today = new Date().toDateString();
      const deliveredToday = orders.filter(o => 
        o.orderStatus === 'DELIVERED' && 
        new Date(o.updatedAt).toDateString() === today
      ).length;

      setStats({ totalOrders, activeShipments, deliveredToday });
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch merchant data:', err);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size="lg" label="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0', color: 'var(--neutral-900)' }}>
            Welcome to Your Dashboard
          </h1>
          <p style={{ color: 'var(--neutral-600)', margin: 0 }}>
            Manage your shipments and track orders in one place
          </p>
        </div>
        <Button 
          variant="primary" 
          size="lg"
          onClick={() => navigate('/merchant/orders/new')}
        >
          + Create New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Card className="stat-card stat-card-primary">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">Total Orders</div>
            <div className="stat-value">{stats?.totalOrders || 0}</div>
          </div>
        </Card>

        <Card className="stat-card stat-card-warning">
          <div className="stat-icon">🚚</div>
          <div className="stat-content">
            <div className="stat-label">Active Shipments</div>
            <div className="stat-value">{stats?.activeShipments || 0}</div>
          </div>
        </Card>

        <Card className="stat-card stat-card-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-label">Delivered Today</div>
            <div className="stat-value">{stats?.deliveredToday || 0}</div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <Button 
            variant="outline" 
            onClick={() => navigate('/merchant/orders/new')}
            style={{ padding: '1.5rem', justifyContent: 'flex-start' }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</div>
              <div style={{ fontWeight: 600 }}>Create New Order</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>
                Start a new shipment booking
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => navigate('/merchant/orders')}
            style={{ padding: '1.5rem', justifyContent: 'flex-start' }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</div>
              <div style={{ fontWeight: 600 }}>View All Orders</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>
                See your complete order history
              </div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            onClick={() => navigate('/merchant/tracking')}
            style={{ padding: '1.5rem', justifyContent: 'flex-start' }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</div>
              <div style={{ fontWeight: 600 }}>Track Shipment</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-600)' }}>
                Check real-time shipment status
              </div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card 
        title="Recent Orders" 
        headerExtra={
          <Button variant="link" size="sm" onClick={() => navigate('/merchant/orders')}>
            View All →
          </Button>
        }
      >
        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-600)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p>No orders yet. Create your first order to get started!</p>
            <Button variant="primary" onClick={() => navigate('/merchant/orders/new')} style={{ marginTop: '1rem' }}>
              Create First Order
            </Button>
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
                  <th>Destination</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
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
                    <td>{order.deliveryAddress?.city || order.deliveryCity}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={() => navigate(`/merchant/orders/${order.orderId}`)}
                      >
                        View Details
                      </Button>
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
