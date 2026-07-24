import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner/LoadingSpinner';
import StatusTimeline from '../../components/features/orders/StatusTimeline';
import { trackingApi } from '../../api/endpoints/tracking';
import { ordersApi } from '../../api/endpoints/orders';
import { useToast } from '../../contexts/ToastContext';
import { CARRIER_NAMES } from '../../utils/constants';

export default function MerchantTracking() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      showToast('Please enter an Order ID or Tracking Number', 'warning');
      return;
    }

    setLoading(true);
    setTrackingData(null);
    setOrderData(null);

    try {
      // Try to fetch by order ID first
      try {
        const orderRes = await ordersApi.getById(searchQuery.trim());
        const order = orderRes.data || orderRes;
        setOrderData(order);

        // Then fetch tracking data
        const trackRes = await trackingApi.getByOrderId(order.orderId);
        setTrackingData(trackRes.data || trackRes);
      } catch (orderErr) {
        // If order fetch fails, try tracking by tracking number
        const trackRes = await trackingApi.getByTrackingNumber(searchQuery.trim());
        setTrackingData(trackRes.data || trackRes);
      }
    } catch (err) {
      console.error('Tracking search failed:', err);
      showToast('No shipment found with that Order ID or Tracking Number', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>Track My Shipment</h1>
        <p style={{ color: 'var(--neutral-600)', margin: 0 }}>
          Enter your Order ID or Tracking Number to view real-time shipment status
        </p>
      </div>

      {/* Search Card */}
      <Card>
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Order ID or Tracking Number"
                placeholder="e.g., ZPY-ORD-10001 or FST123456789"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" loading={loading}>
              🔍 Track Shipment
            </Button>
          </div>
        </form>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <LoadingSpinner size="lg" label="Searching for shipment..." />
          </div>
        </Card>
      )}

      {/* Tracking Results */}
      {!loading && trackingData && (
        <>
          {/* Shipment Info Card */}
          <Card title="Shipment Information">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>
                  Order ID
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {trackingData.orderId || orderData?.orderId || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>
                  Tracking Number
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {trackingData.trackingNumber || 'Generating...'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>
                  Courier Partner
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                  {CARRIER_NAMES[trackingData.carrierCode] || trackingData.carrierCode || 'Not assigned'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.25rem' }}>
                  Current Status
                </div>
                <div>
                  <span className={`status-badge status-${trackingData.currentStatus?.toLowerCase().replace(/_/g, '-')}`}>
                    {trackingData.currentStatus?.replace(/_/g, ' ') || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            {orderData && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--neutral-200)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--neutral-600)', marginBottom: '0.75rem' }}>
                  Delivery Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Customer:</strong> {orderData.customer?.name || orderData.customerName}
                  </div>
                  <div>
                    <strong>Destination:</strong> {orderData.deliveryAddress?.city || orderData.deliveryCity}, {orderData.deliveryAddress?.pincode || orderData.deliveryPincode}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Status Timeline */}
          <StatusTimeline 
            currentStatus={trackingData.currentStatus}
            events={trackingData.events || []}
          />

          {/* Actions */}
          <Card>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button 
                variant="outline"
                onClick={() => {
                  setTrackingData(null);
                  setOrderData(null);
                  setSearchQuery('');
                }}
              >
                ← Track Another Shipment
              </Button>
              {orderData && (
                <Button 
                  variant="primary"
                  onClick={() => navigate(`/merchant/orders/${orderData.orderId}`)}
                >
                  View Full Order Details
                </Button>
              )}
            </div>
          </Card>
        </>
      )}

      {/* Empty State - Initial */}
      {!loading && !trackingData && (
        <Card>
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--neutral-600)' }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--neutral-800)' }}>
              Track Your Shipment
            </h3>
            <p style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
              Enter your Order ID or Tracking Number in the search box above to view the latest shipment status and delivery timeline.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="outline" onClick={() => navigate('/merchant/orders')}>
                View My Orders
              </Button>
              <Button variant="primary" onClick={() => navigate('/merchant/orders/new')}>
                Create New Order
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
