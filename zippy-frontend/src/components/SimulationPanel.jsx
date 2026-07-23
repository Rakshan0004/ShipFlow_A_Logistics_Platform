import React, { useState } from 'react';

export default function SimulationPanel({ activeShipment, onRefreshOrder }) {
  const [carrier, setCarrier] = useState('FASTSHIP');
  const [trackingNumber, setTrackingNumber] = useState(
    activeShipment?.shipment?.trackingNumber || 'FST123456789'
  );
  const [failToggle, setFailToggle] = useState(false);
  const [delayMs, setDelayMs] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [triggering, setTriggering] = useState(false);

  const handleAdvanceStatus = async () => {
    setTriggering(true);
    setStatusMessage('');
    try {
      const response = await fetch(`http://localhost:8081/mock/shipments/${carrier.toLowerCase()}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber })
      });
      const data = await response.json();
      setStatusMessage(`✅ Advanced status: ${data.previousStatus} ➔ ${data.newStatus} (Webhook Sent: ${data.webhookSent})`);
      if (onRefreshOrder) {
        setTimeout(onRefreshOrder, 600);
      }
    } catch (err) {
      setStatusMessage(`❌ Error calling mock courier service: ${err.message}`);
    } finally {
      setTriggering(false);
    }
  };

  const handleSetStatus = async (targetStatus) => {
    setTriggering(true);
    setStatusMessage('');
    try {
      const response = await fetch(`http://localhost:8081/mock/shipments/${carrier.toLowerCase()}/set-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingNumber, status: targetStatus })
      });
      const data = await response.json();
      setStatusMessage(`⚡ Set status to ${targetStatus}: Webhook sent to Zippy Backend`);
      if (onRefreshOrder) {
        setTimeout(onRefreshOrder, 600);
      }
    } catch (err) {
      setStatusMessage(`❌ Error sending status webhook: ${err.message}`);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">⚙️ Mock Courier Simulation Controls</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
        Trigger real-time courier webhooks, simulate HTTP 500 errors, test artificial delays, and verify status normalization.
      </p>

      <div className="sim-grid">
        <div className="sim-box">
          <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>1. Select Target Courier</label>
          <select className="form-control" value={carrier} onChange={(e) => setCarrier(e.target.value)}>
            <option value="FASTSHIP">FastShip</option>
            <option value="QUICKEXPRESS">QuickExpress</option>
            <option value="RELIABLE">ReliableCourier</option>
          </select>

          <label style={{ fontWeight: 700, fontSize: '0.9rem', marginTop: '0.5rem' }}>Tracking Number / AWB</label>
          <input
            type="text"
            className="form-control"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </div>

        <div className="sim-box">
          <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>2. Live Webhook Dispatcher</label>
          <button className="btn-primary" onClick={handleAdvanceStatus} disabled={triggering}>
            ⏩ Advance to Next Status
          </button>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => handleSetStatus('IN_TRANSIT')}>
              Set In Transit
            </button>
            <button className="btn-secondary" style={{ fontSize: '0.8rem' }} onClick={() => handleSetStatus('DELIVERED')}>
              Set Delivered
            </button>
          </div>
        </div>

        <div className="sim-box">
          <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>3. Test Edge Cases</label>
          <button
            className="btn-secondary"
            style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.4)' }}
            onClick={() => handleSetStatus('IN_TRANSIT')}
          >
            🧪 Test Invalid Transition (DELIVERED ➔ IN_TRANSIT)
          </button>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Failure Parameter: <strong style={{ color: '#a5b4fc' }}>?fail=true</strong> & Delay: <strong style={{ color: '#a5b4fc' }}>{delayMs}ms</strong>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#0f172a', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontWeight: 600 }}>
          {statusMessage}
        </div>
      )}
    </div>
  );
}
