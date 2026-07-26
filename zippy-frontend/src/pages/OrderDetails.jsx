import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import OrderSummaryCard from '../components/features/orders/OrderSummaryCard';
import CustomerInfoCard from '../components/features/orders/CustomerInfoCard';
import AddressCard from '../components/features/orders/AddressCard';
import StatusTimeline from '../components/features/orders/StatusTimeline';
import Card from '../components/ui/Card/Card';
import Button from '../components/ui/Button/Button';
import Modal from '../components/ui/Modal/Modal';
import StatusBadge from '../components/ui/StatusBadge/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner/LoadingSpinner';
import { ordersApi } from '../api/endpoints/orders';
import { trackingApi } from '../api/endpoints/tracking';
import { useToast } from '../contexts/ToastContext';
import { CARRIER_NAMES } from '../utils/constants';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  // Detect if we're on admin or merchant route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const basePath = isAdminRoute ? '/admin' : '/merchant';

  const [order, setOrder] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrderDetails = async (isPoll = false) => {
    if (!isPoll) setLoading(true);
    try {
      const res = await ordersApi.getById(id);
      const data = res.data || res;
      setOrder(data);

      // Try fetching tracking history if order has shipment
      try {
        const trackRes = await trackingApi.getByOrderId(id);
        setTrackingInfo(trackRes.data || trackRes);
      } catch (e) {
        // Tracking might not be initialized yet
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
      if (!isPoll) {
        showToast(`Order ${id} not found`, 'error');
      }
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();

    // Auto-polling for active in-transit orders
    const interval = setInterval(() => {
      if (order && !['DELIVERED', 'CANCELLED', 'RTO'].includes(order.orderStatus)) {
        fetchOrderDetails(true);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await ordersApi.cancel(id);
      showToast(`Order ${id} cancelled successfully`, 'info');
      setCancelModalOpen(false);
      fetchOrderDetails();
    } catch (err) {
      showToast(err.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size="lg" label="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <Card style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Order Not Found</h2>
        <p style={{ color: 'var(--neutral-600)', margin: '1rem 0' }}>No order exists with ID "{id}".</p>
        <Button variant="primary" onClick={() => navigate(`${basePath}/orders`)}>Back to All Orders</Button>
      </Card>
    );
  }

  const canCancel = !['DELIVERED', 'CANCELLED', 'RTO'].includes(order.orderStatus);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={() => navigate(`${basePath}/orders`)}>
            ← Back to Orders
          </Button>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Order Details: {order.orderId}</h2>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {order.orderStatus === 'ORDER_CREATED' && (
            <Button variant="primary" onClick={() => navigate(`${basePath}/orders/${order.orderId}/rates`)}>
              ⚡ Select Courier & Compare Rates
            </Button>
          )}

          {trackingInfo?.trackingNumber && (
            <Link to={`/tracking/public/${trackingInfo.trackingNumber}`}>
              <Button variant="outline">
                🔍 Public Tracking Portal
              </Button>
            </Link>
          )}

          {canCancel && (
            <Button variant="danger" onClick={() => setCancelModalOpen(true)}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Main Order Details Cards */}
      <OrderSummaryCard order={order} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <CustomerInfoCard customer={order.customer} />
        <AddressCard pickupAddress={order.pickupAddress} deliveryAddress={order.deliveryAddress} />
      </div>

      {/* Carrier & Shipment Booking Card (If selected) */}
      {(order.selectedCarrierCode || trackingInfo?.carrierCode) && (
        <Card title="Booked Courier & Shipment Info">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Assigned Courier</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-500)' }}>
                {CARRIER_NAMES[order.selectedCarrierCode || trackingInfo?.carrierCode] || order.selectedCarrierCode}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>AWB Tracking Number</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {trackingInfo?.trackingNumber || order.awbNumber || 'Generating AWB...'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)' }}>Estimated Delivery</div>
              <div style={{ fontSize: '0.95rem', color: 'var(--success)', fontWeight: 600 }}>
                {trackingInfo?.estimatedDelivery || '2-3 Business Days'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <StatusTimeline 
        currentStatus={order.orderStatus} 
        events={trackingInfo?.events || order.statusHistory || []} 
      />

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Order Confirmation"
        footer={
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setCancelModalOpen(false)}>Keep Order</Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancelOrder}>Confirm Cancel</Button>
          </div>
        }
      >
        <p style={{ color: 'var(--neutral-700)' }}>
          Are you sure you want to cancel order <strong>{order.orderId}</strong>? This operation will notify the assigned courier and update the order state to CANCELLED.
        </p>
      </Modal>
    </div>
  );
}
