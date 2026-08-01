import React, { useState, useEffect } from 'react';

const STAGES = [
  { id: 'SHIPMENT_CREATED', label: 'Created' },
  { id: 'PICKED_UP', label: 'Picked Up' },
  { id: 'IN_TRANSIT', label: 'In Transit' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { id: 'DELIVERED', label: 'Delivered' }
];

export default function SimulationPanel({ activeShipment, onRefreshOrder }) {
  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(
    activeShipment?.orderId || ''
  );
  
  const [carrier, setCarrier] = useState(
    activeShipment?.shipment?.carrierCode || 'RELIABLE'
  );
  const [trackingNumber, setTrackingNumber] = useState(
    activeShipment?.shipment?.trackingNumber || 'RC71556180'
  );
  const [currentStage, setCurrentStage] = useState(
    activeShipment?.shipment?.currentStatus || 'SHIPMENT_CREATED'
  );

  const [notification, setNotification] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch all orders on component mount
  useEffect(() => {
    fetchAllOrders();
  }, []);

  useEffect(() => {
    if (activeShipment?.shipment?.trackingNumber) {
      setTrackingNumber(activeShipment.shipment.trackingNumber);
      if (activeShipment.orderId) setSelectedOrderId(activeShipment.orderId);
      if (activeShipment.shipment.carrierCode) setCarrier(activeShipment.shipment.carrierCode);
      if (activeShipment.shipment.currentStatus) setCurrentStage(activeShipment.shipment.currentStatus);
    }
  }, [activeShipment]);

  const fetchAllOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('http://localhost:8080/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrdersList(data);
        if (data.length > 0 && !selectedOrderId) {
          const firstWithShipment = data.find(o => o.shipment) || data[0];
          setSelectedOrderId(firstWithShipment.orderId);
          handleSelectOrder(firstWithShipment.orderId);
        }
      }
    } catch (err) {
      console.warn('Failed to load orders list:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSelectOrder = async (orderIdToLoad) => {
    setSelectedOrderId(orderIdToLoad);
    if (!orderIdToLoad) return;

    try {
      const res = await fetch(`http://localhost:8080/api/orders/track/${encodeURIComponent(orderIdToLoad)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.shipment) {
          setTrackingNumber(data.shipment.trackingNumber);
          setCarrier(data.shipment.carrierCode);
          setCurrentStage(data.shipment.currentStatus || 'SHIPMENT_CREATED');
          setNotification({
            type: 'success',
            message: `📦 Loaded Order #${data.orderId}: Customer ${data.customerName || 'N/A'} | Courier: ${data.shipment.carrierCode} | AWB: ${data.shipment.trackingNumber}`
          });
        } else {
          setNotification({
            type: 'info',
            message: `ℹ️ Order #${data.orderId} found, but no courier shipment has been booked for it yet. Select an order with a booked shipment.`
          });
        }
      }
    } catch (err) {
      console.warn('Order lookup failed:', err);
    }
  };

  const executeTrigger = async (endpointPath, payloadObj) => {
    setTriggering(true);
    setNotification(null);
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
        ok: res.ok,
        timestamp: new Date().toLocaleTimeString(),
        data: data
      });

      if (data.newStatus) {
        setCurrentStage(data.newStatus);
        setNotification({
          type: 'success',
          message: `✅ Webhook Sent Successfully! Carrier: ${data.carrier} | Active AWB: ${data.trackingNumber} | Status Transition: ${data.previousStatus || 'Previous'} ➔ ${data.newStatus}`
        });
      } else {
        setNotification({
          type: 'info',
          message: `⚡ Webhook Call Processed (Status HTTP ${res.status})`
        });
      }

      if (onRefreshOrder) {
        setTimeout(onRefreshOrder, 500);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `❌ Error: Failed to reach Mock Courier Service at port 8081. (${err.message})`
      });
      setLastResponse({
        url: targetUrl,
        status: 'NETWORK_ERROR',
        ok: false,
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
      
      {/* Action Notification Banner */}
      {notification && (
        <div className={`alert-${notification.type === 'error' ? 'warning' : 'success'}`} style={{ margin: 0, fontWeight: 600 }}>
          {notification.message}
        </div>
      )}

      {/* Webhook Studio Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>⚙ Webhook & Status Simulation Studio</h2>
            <div style={{ color: '#d4d4d4', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Simulate live courier webhook dispatches to transition orders from <strong>Picked Up</strong> ➔ <strong>In Transit</strong> ➔ <strong>Delivered</strong>.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-status">ACTIVE PARCEL AWB</span>
            <div style={{ fontWeight: 800, marginTop: '0.2rem', color: '#ffffff', fontSize: '1.15rem', letterSpacing: '0.5px' }}>{trackingNumber}</div>
          </div>
        </div>

        {/* HR / Reviewer Order Selection Dropdown */}
        <div style={{ background: '#000000', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #262626', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: 700 }}>
              📋 Select Any Created Order to Test Webhooks (Reviewer Quick-Select):
            </label>
            <button
              onClick={fetchAllOrders}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              🔄 Refresh List
            </button>
          </div>

          <select
            className="form-control"
            style={{ fontSize: '0.95rem', padding: '0.75rem 1rem', background: '#0a0a0a', color: '#ffffff', borderColor: '#404040' }}
            value={selectedOrderId}
            onChange={(e) => handleSelectOrder(e.target.value)}
            disabled={loadingOrders}
          >
            <option value="">-- Select an Order from Database --</option>
            {ordersList.map((ord) => (
              <option key={ord.orderId} value={ord.orderId}>
                Order #{ord.orderId} | {ord.customer?.name || 'Customer'} | {ord.shipment ? `Courier: ${ord.shipment.carrierCode} (AWB: ${ord.shipment.trackingNumber})` : 'Status: ' + ord.orderStatus}
              </option>
            ))}
          </select>
        </div>

        {/* Live Stepper Inside Studio */}
        <div style={{ background: '#000000', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #262626', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#d4d4d4', fontWeight: 600, marginBottom: '0.75rem' }}>
            CURRENT SHIPMENT STATUS: <span style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem' }}>{currentStage}</span>
          </div>

          <div className="timeline-wrapper" style={{ margin: '1rem 0 0.5rem 0' }}>
            <div className="timeline-line">
              <div className="timeline-line-progress" style={{ width: `${progressPercent}%` }} />
            </div>

            {STAGES.map((s, idx) => {
              const isCompleted = idx < activeStep;
              const isActive = idx === activeStep;
              return (
                <div key={s.id} className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div className="step-node">{isCompleted ? '✓' : idx + 1}</div>
                  <div className="step-label">{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls Grid */}
        <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label>Assigned Courier Service</label>
            <select className="form-control" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
              <option value="RELIABLE">ReliableCourier</option>
              <option value="FASTSHIP">FastShip</option>
              <option value="QUICKEXPRESS">QuickExpress</option>
            </select>
          </div>

          <div className="form-group">
            <label>Active Parcel AWB Number</label>
            <input
              type="text"
              className="form-control"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Triggers Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Main Advance Button */}
          <div>
            <button
              className="btn-primary"
              onClick={() => executeTrigger('advance', { trackingNumber })}
              disabled={triggering}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
            >
              {triggering ? 'Dispatching Webhook...' : '⏩ Advance Status Stage (Next Automatic Stage)'}
            </button>
          </div>

          {/* Direct Status Buttons */}
          <div>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#d4d4d4', marginBottom: '0.5rem' }}>
              Direct Webhook Triggers for HR / Tester Review:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'PICKED_UP' })} disabled={triggering}>
                📦 Picked Up
              </button>
              <button className="btn-secondary" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'IN_TRANSIT' })} disabled={triggering}>
                🚚 In Transit
              </button>
              <button className="btn-secondary" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'OUT_FOR_DELIVERY' })} disabled={triggering}>
                🛵 Out for Delivery
              </button>
              <button className="btn-secondary" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'DELIVERED' })} disabled={triggering}>
                🎉 Delivered
              </button>
              <button className="btn-secondary" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'DELIVERY_FAILED' })} disabled={triggering}>
                ⚠️ Delivery Failed
              </button>
              <button className="btn-secondary" onClick={() => executeTrigger('set-status', { trackingNumber, status: 'RTO' })} disabled={triggering}>
                ↩️ RTO (Return to Origin)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Console */}
      {lastResponse && (
        <div className="card" style={{ background: '#000000' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
              POST {lastResponse.url} ({lastResponse.timestamp})
            </div>
            <span className="badge badge-status">HTTP {lastResponse.status}</span>
          </div>

          <pre style={{
            background: '#000000',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #262626',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '0.825rem',
            overflowX: 'auto'
          }}>
            {JSON.stringify(lastResponse.data || lastResponse.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
