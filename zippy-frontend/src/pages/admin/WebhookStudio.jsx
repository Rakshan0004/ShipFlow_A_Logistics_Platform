import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import Select from '../../components/ui/Select/Select';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import Modal from '../../components/ui/Modal/Modal';
import { ordersApi } from '../../api/endpoints/orders';
import { useToast } from '../../contexts/ToastContext';

const STAGES = [
  { id: 'SHIPMENT_CREATED', label: 'Created', icon: '📝' },
  { id: 'PICKED_UP', label: 'Picked Up', icon: '📦' },
  { id: 'IN_TRANSIT', label: 'In Transit', icon: '🚚' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵' },
  { id: 'DELIVERED', label: 'Delivered', icon: '🎉' }
];

export default function WebhookStudio() {
  const { showToast } = useToast();
  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [carrier, setCarrier] = useState('RELIABLE');
  const [trackingNumber, setTrackingNumber] = useState('RC71556180');
  const [currentStage, setCurrentStage] = useState('SHIPMENT_CREATED');

  const [lastResponse, setLastResponse] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, targetStatus: '' });

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await ordersApi.getAll();
      const list = res.data || res;
      if (Array.isArray(list) && list.length > 0) {
        setOrdersList(list);
        if (!selectedOrderId) {
          setSelectedOrderId(list[0].orderId);
          handleSelectOrder(list[0].orderId, list);
        }
      }
    } catch (err) {
      console.warn('Failed to load orders for webhook studio:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSelectOrder = async (orderIdToLoad, currentList = ordersList) => {
    setSelectedOrderId(orderIdToLoad);
    const found = currentList.find(o => o.orderId === orderIdToLoad);
    if (found) {
      try {
        const fullRes = await ordersApi.getById(orderIdToLoad);
        const fullOrder = fullRes.data || fullRes;
        const tracking = fullOrder.awbNumber || fullOrder.shipment?.trackingNumber || fullOrder.trackingNumber || found.orderId;
        setTrackingNumber(tracking);
        setCarrier(fullOrder.selectedCarrierCode || fullOrder.carrierCode || 'RELIABLE');
        setCurrentStage(fullOrder.orderStatus || 'SHIPMENT_CREATED');
      } catch (e) {
        setTrackingNumber(found.trackingNumber || found.orderId);
        setCarrier(found.carrierCode || 'RELIABLE');
        setCurrentStage(found.orderStatus || 'SHIPMENT_CREATED');
      }
      showToast(`Loaded Order #${found.orderId}`, 'info');
    }
  };

  const executeTrigger = async (endpointPath, payloadObj) => {
    setTriggering(true);
    setLastResponse(null);

    const targetUrl = `http://localhost:8081/mock/shipments/${carrier.toLowerCase()}/${endpointPath}`;

    try {
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadObj)
      });

      const data = await res.json();
      setLastResponse({
        url: targetUrl,
        status: res.status,
        timestamp: new Date().toLocaleTimeString(),
        data: data
      });

      if (data.newStatus) {
        setCurrentStage(data.newStatus);
        showToast(`Webhook Success! Transitioned to ${data.newStatus}`, 'success');
      } else {
        showToast(`Webhook call processed (HTTP ${res.status})`, 'success');
      }
    } catch (err) {
      console.error('Webhook execution failed:', err);
      showToast(`Error connecting to Mock Courier Service at port 8081: ${err.message}`, 'error');
      setLastResponse({
        url: targetUrl,
        status: 'NETWORK_ERROR',
        timestamp: new Date().toLocaleTimeString(),
        error: err.message
      });
    } finally {
      setTriggering(false);
    }
  };

  const activeIdx = STAGES.findIndex(s => s.id === currentStage);
  const activeStep = activeIdx >= 0 ? activeIdx : 0;
  const progressPercent = (activeStep / (STAGES.length - 1)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Studio Header */}
      <Card title="⚡ Webhook Simulation & Lifecycle Studio">
        <p style={{ color: 'var(--neutral-600)', marginBottom: '1.25rem' }}>
          Simulate real-time courier status callbacks (e.g. <strong>Picked Up</strong> ➔ <strong>In Transit</strong> ➔ <strong>Delivered</strong>) to test backend event handlers and UI reactivity.
        </p>

        {/* Order Selector */}
        <div style={{ background: 'var(--neutral-100)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--neutral-900)' }}>
              Select Shipment Order to Test Webhooks:
            </label>
            <Button variant="outline" size="sm" onClick={fetchOrders} loading={loadingOrders}>
              🔄 Refresh List
            </Button>
          </div>

          <Select
            value={selectedOrderId}
            onChange={(val) => handleSelectOrder(val)}
            options={[
              { value: '', label: '-- Select an Order --' },
              ...ordersList.map(o => ({
                value: o.orderId,
                label: `Order #${o.orderId} | ${o.customer?.name || 'Customer'} | Status: ${o.orderStatus}`
              }))
            ]}
          />
        </div>

        {/* Status Stepper */}
        <div style={{ background: 'var(--neutral-100)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-600)' }}>CURRENT STATUS:</span>
            <StatusBadge status={currentStage} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', overflowX: 'auto', padding: '0.5rem 0' }}>
            {STAGES.map((s, idx) => {
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep;
              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', zIndex: 2 }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isCompleted ? 'var(--success)' : isActive ? 'var(--primary-500)' : 'var(--neutral-300)',
                    color: '#ffffff',
                    fontWeight: 700
                  }}>
                    {isCompleted ? '✓' : s.icon}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: isActive ? 700 : 500, marginTop: '0.4rem', color: isActive ? 'var(--primary-500)' : 'var(--neutral-600)' }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inputs & Triggers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <Select
            label="Courier Network"
            value={carrier}
            onChange={setCarrier}
            options={[
              { value: 'RELIABLE', label: 'ReliableCourier (Port 8081)' },
              { value: 'FASTSHIP', label: 'FastShip (Port 8081)' },
              { value: 'QUICKEXPRESS', label: 'QuickExpress (Port 8081)' }
            ]}
          />

          <Input
            label="AWB Tracking Number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </div>

        {/* Primary Advance Button */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Button
            variant="primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            loading={triggering}
            onClick={() => executeTrigger('advance', { trackingNumber })}
          >
            ⏩ Advance Status Stage (Next Automatic Stage)
          </Button>
        </div>

        {/* Specific Direct Status Buttons */}
        <div>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--neutral-700)', display: 'block', marginBottom: '0.5rem' }}>
            Direct Status Webhook Buttons:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'PICKED_UP' })}>
              📦 Picked Up
            </Button>
            <Button variant="outline" size="sm" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'IN_TRANSIT' })}>
              🚚 In Transit
            </Button>
            <Button variant="outline" size="sm" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'OUT_FOR_DELIVERY' })}>
              🛵 Out for Delivery
            </Button>
            <Button variant="outline" size="sm" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'DELIVERED' })}>
              🎉 Delivered
            </Button>
            <Button variant="outline" size="sm" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'DELIVERY_FAILED' })}>
              ⚠️ Delivery Failed
            </Button>
            <Button variant="outline" size="sm" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'RTO' })}>
              ↩️ RTO (Return to Origin)
            </Button>
          </div>
        </div>
      </Card>

      {/* Payload Inspection Log */}
      {lastResponse && (
        <Card title={`Execution Log: POST ${lastResponse.url}`}>
          <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginBottom: '0.5rem' }}>
            Status: HTTP {lastResponse.status} • Time: {lastResponse.timestamp}
          </div>
          <pre style={{
            background: '#0f172a',
            color: '#38bdf8',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: '1.5',
            overflowX: 'auto',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)'
          }}>
            {JSON.stringify(lastResponse.data || lastResponse.error, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
