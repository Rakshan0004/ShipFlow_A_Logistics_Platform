import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../components/features/orders/OrderForm';
import { ordersApi } from '../api/endpoints/orders';
import { useToast } from '../contexts/ToastContext';

export default function OrderCreate() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleOrderCreated = async (payload) => {
    setLoading(true);
    try {
      const res = await ordersApi.create(payload);
      const orderData = res.data || res;
      showToast('Order created successfully! Redirecting to rate comparison...', 'success');
      
      const orderId = orderData.orderId || orderData.id;
      if (orderId) {
        navigate(`/orders/${orderId}/rates`, { state: { order: orderData } });
      } else {
        navigate('/orders');
      }
    } catch (err) {
      console.error('Failed to create order:', err);
      showToast(err.message || 'Failed to create order. Check backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <OrderForm onOrderCreated={handleOrderCreated} loading={loading} />
    </div>
  );
}
