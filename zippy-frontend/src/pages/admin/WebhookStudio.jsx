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
  { id: 'DELIVERED', label: 'Delivered', icon: '🏁' }
];

export default function WebhookStudio() {
  const { showToast } = useToast();
  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
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
        
        console.log('📦 Order Details:', fullOrder);
        setSelectedOrderDetails(fullOrder);
        
        // Get tracking number from various possible fields
        const tracking = fullOrder.shipment?.awbNumber || 
                        fullOrder.awbNumber || 
                        fullOrder.shipment?.trackingNumber || 
                        fullOrder.trackingNumber || 
                        `ZPY-AWB-${fullOrder.orderId.split('-').pop()}`;
        
        setTrackingNumber(tracking);
        
        const selectedCarrier = fullOrder.selectedCarrierCode || fullOrder.shipment?.carrierCode || fullOrder.carrierCode || 'RELIABLE';
        setCarrier(selectedCarrier);
        
        // Determine actual current status - try multiple sources
        let mappedStatus = 'SHIPMENT_CREATED';
        
        // Priority 1: Check shipment.currentStatus (most accurate)
        if (fullOrder.shipment?.currentStatus) {
          mappedStatus = fullOrder.shipment.currentStatus;
          console.log('✅ Using shipment.currentStatus:', mappedStatus);
        } 
        // Priority 2: Check orderStatus if it's a shipment stage
        else if (fullOrder.orderStatus) {
          const orderStatus = fullOrder.orderStatus;
          console.log('📋 Order Status:', orderStatus);
          
          // If orderStatus is already a shipment stage, use it directly
          const shipmentStages = ['SHIPMENT_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
          if (shipmentStages.includes(orderStatus)) {
            mappedStatus = orderStatus;
            console.log('✅ Using orderStatus directly:', mappedStatus);
          } else {
            // Map order status to shipment stage
            switch(orderStatus) {
              case 'ORDER_CREATED':
              case 'CARRIER_SELECTED':
                mappedStatus = 'SHIPMENT_CREATED';
                break;
              default:
                mappedStatus = 'SHIPMENT_CREATED';
            }
            console.log('🔄 Mapped orderStatus to:', mappedStatus);
          }
        }
        
        setCurrentStage(mappedStatus);
        console.log('🎯 Final Current Stage:', mappedStatus);
        showToast(`Loaded Order #${fullOrder.orderId} - Status: ${mappedStatus}`, 'info');
      } catch (e) {
        console.error('Error loading order details:', e);
        setSelectedOrderDetails(found);
        setTrackingNumber(found.trackingNumber || found.orderId);
        setCarrier(found.selectedCarrierCode || found.carrierCode || 'RELIABLE');
        setCurrentStage('SHIPMENT_CREATED');
        showToast(`Loaded Order #${found.orderId}`, 'info');
      }
    }
  };

  const executeTrigger = async (endpointPath, payloadObj) => {
    setTriggering(true);
    setLastResponse(null);

    const targetUrl = `/mock/shipments/${carrier.toLowerCase()}/${endpointPath}`;

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

      // Parse backend response body returned inside mock service wrapper
      let backendStatus = null;
      let backendMsg = null;
      if (data.backendResponseBody) {
        try {
          const parsed = typeof data.backendResponseBody === 'string'
            ? JSON.parse(data.backendResponseBody)
            : data.backendResponseBody;
          backendStatus = parsed.status;
          backendMsg = parsed.message;
        } catch (e) {
          if (data.backendResponseBody.includes('UNKNOWN_SHIPMENT')) {
            backendStatus = 'IGNORED';
            backendMsg = 'UNKNOWN_SHIPMENT';
          }
        }
      }

      if (backendStatus === 'IGNORED' && backendMsg === 'UNKNOWN_SHIPMENT') {
        showToast(`❌ Webhook Ignored: UNKNOWN_SHIPMENT. Order #${selectedOrderId} is not booked with a courier yet!`, 'error');
      } else if (backendStatus === 'REJECTED_INVALID_TRANSITION') {
        showToast(`⚠️ Rejected Transition: ${backendMsg}`, 'warning');
      } else if (backendStatus === 'DUPLICATE_IGNORED') {
        showToast(`ℹ️ Webhook Ignored: Duplicate event already processed by backend`, 'info');
      } else if (backendStatus === 'PROCESSED') {
        if (data.newStatus) {
          setCurrentStage(data.newStatus);
        }
        showToast(`✅ Webhook Success! Backend updated status to ${data.newStatus}`, 'success');
      } else if (data.newStatus) {
        setCurrentStage(data.newStatus);
        showToast(`Webhook call dispatched! Status: ${data.newStatus}`, 'success');
      } else {
        showToast(`Webhook call processed (HTTP ${res.status})`, 'info');
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

  const isOrderUnbooked = selectedOrderDetails && 
    (selectedOrderDetails.orderStatus === 'ORDER_CREATED' || selectedOrderDetails.orderStatus === 'CARRIER_SELECTED') && 
    !selectedOrderDetails.shipment;

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
            onChange={(e) => handleSelectOrder(e.target.value)}
            options={[
              { value: '', label: '-- Select an Order --' },
              ...ordersList.map(o => ({
                value: o.orderId,
                label: `Order #${o.orderId} | ${o.customer?.name || 'Customer'} | Status: ${o.orderStatus}`
              }))
            ]}
          />

          {isOrderUnbooked && (
            <div style={{
              marginTop: '1rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid #ef4444',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#f87171'
            }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <div style={{ fontSize: '0.84rem' }}>
                <strong style={{ display: 'block', color: '#ef4444', marginBottom: '0.15rem' }}>
                  Order Not Booked with Courier Yet
                </strong>
                This order is in <code>{selectedOrderDetails?.orderStatus || 'ORDER_CREATED'}</code> state. Webhooks will return <code>UNKNOWN_SHIPMENT</code> until a carrier is selected and a shipment is booked on the Rate Comparison page.
              </div>
            </div>
          )}
        </div>

        {/* Status Stepper */}
        <div style={{ background: 'var(--neutral-100)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-600)' }}>CURRENT STATUS:</span>
            <StatusBadge status={currentStage} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', overflowX: 'auto', padding: '1rem 0' }}>
            {/* Background Track Line */}
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '40px',
              right: '40px',
              height: '4px',
              background: 'var(--neutral-300)',
              opacity: 0.3,
              zIndex: 1,
              borderRadius: '2px'
            }} />

            {/* Filled Progress Bar */}
            <div style={{
              position: 'absolute',
              top: '30px',
              left: '40px',
              width: `calc(${progressPercent}% * (1 - 80px / 100%))`,
              height: '4px',
              background: 'linear-gradient(90deg, #10b981 0%, #0ea5e9 100%)',
              zIndex: 1,
              borderRadius: '2px',
              transition: 'width 0.4s ease'
            }} />

            {STAGES.map((s, idx) => {
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep;
              const isFuture = idx > activeStep;

              return (
                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', zIndex: 2 }}>
                  <div style={{
                    width: isActive ? '46px' : '40px',
                    height: isActive ? '46px' : '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 
                      isCompleted ? 'var(--success)' : 
                      isActive ? 'var(--primary-500)' : 
                      'rgba(156, 163, 175, 0.15)',
                    color: isFuture ? 'var(--neutral-400)' : '#ffffff',
                    border: isActive 
                      ? '3px solid #38bdf8' 
                      : isFuture 
                        ? '2px solid rgba(156, 163, 175, 0.25)' 
                        : 'none',
                    boxShadow: isActive 
                      ? '0 0 20px rgba(14, 165, 233, 0.9), 0 0 8px rgba(56, 189, 248, 0.6)' 
                      : isCompleted 
                        ? '0 0 8px rgba(16, 185, 129, 0.3)' 
                        : 'none',
                    fontSize: isActive ? '1.2rem' : '1rem',
                    fontWeight: 700,
                    opacity: isFuture ? 0.35 : 1,
                    filter: isFuture ? 'grayscale(100%)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)'
                  }}>
                    {isCompleted ? '✓' : s.icon}
                  </div>
                  <span style={{
                    fontSize: isActive ? '0.78rem' : '0.72rem',
                    fontWeight: isActive ? 700 : isCompleted ? 600 : 400,
                    marginTop: '0.5rem',
                    color: isActive 
                      ? '#38bdf8' 
                      : isCompleted 
                        ? 'var(--success)' 
                        : 'var(--neutral-500)',
                    opacity: isFuture ? 0.45 : 1,
                    textShadow: isActive ? '0 0 8px rgba(14, 165, 233, 0.5)' : 'none',
                    textAlign: 'center'
                  }}>
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
            onChange={(e) => setCarrier(e.target.value)}
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
