import React, { useState } from 'react';
import TrackingTimeline from './TrackingTimeline';

export default function CustomerTrackingSearch({ activeOrder }) {
  const [searchQuery, setSearchQuery] = useState(activeOrder?.orderId || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setTrackingData(null);

    const query = searchQuery.trim();

    try {
      // Use flexible tracking lookup API
      const res = await fetch(`http://localhost:8080/api/orders/track/${encodeURIComponent(query)}`);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || `No order or shipment found matching '${query}'.`);
      }

      const data = await res.json();
      setTrackingData(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Search Header Card */}
      <div className="card">
        <h2 className="card-title">🔍 Track Any Parcel / Order</h2>
        <p style={{ color: '#d4d4d4', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Search by <strong>Zippy Order ID</strong> (e.g. <code>ZPY-ORD-10009</code>), <strong>Merchant Order Ref</strong> (e.g. <code>DEMO-12345</code>), or <strong>Tracking AWB Number</strong> (e.g. <code>RC23541889</code>).
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="form-control"
            style={{ flex: 1, minWidth: '260px', fontSize: '1rem', padding: '0.8rem 1rem' }}
            placeholder="Enter Order ID, AWB, or Merchant Ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.8rem 1.75rem' }}>
            {loading ? 'Searching...' : '🔍 Track Package →'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="alert-warning">
          ⚠️ <strong>Search Result:</strong> {errorMsg}
        </div>
      )}

      {/* Search Result Tracking View */}
      {trackingData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Order Details Header */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-status">ORDER TRACKING DETAILS</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.3rem', color: '#ffffff' }}>
                  Order #{trackingData.orderId}
                </h3>
                <div style={{ color: '#a3a3a3', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                  Merchant Ref: <strong style={{ color: '#ffffff' }}>{trackingData.merchantOrderId || 'N/A'}</strong> | Customer: <strong style={{ color: '#ffffff' }}>{trackingData.customerName || 'Customer'}</strong>
                </div>
                <div style={{ color: '#a3a3a3', fontSize: '0.85rem' }}>
                  Route: {trackingData.pickupCity || 'Origin'} ➔ {trackingData.deliveryCity || 'Destination'} | Payment: {trackingData.paymentType} {trackingData.codAmount ? `(₹${trackingData.codAmount})` : ''}
                </div>
              </div>

              {trackingData.shipment?.trackingNumber && (
                <div style={{ background: '#000000', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #262626', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#a3a3a3', fontWeight: 600 }}>AWB TRACKING NUMBER</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#ffffff', letterSpacing: '0.5px' }}>{trackingData.shipment.trackingNumber}</div>
                  <div style={{ fontSize: '0.75rem', color: '#d4d4d4', marginTop: '0.1rem' }}>{trackingData.shipment.carrierCode} ({trackingData.shipment.serviceCode})</div>
                </div>
              )}
            </div>

            {/* Stepper Timeline Component */}
            <TrackingTimeline currentStatus={trackingData.shipment?.currentStatus || trackingData.orderStatus || 'ORDER_CREATED'} />
          </div>

          {/* Event History Audit Log */}
          {trackingData.eventHistory && trackingData.eventHistory.length > 0 && (
            <div className="card">
              <h3 className="card-title">📜 Carrier Webhook Audit Timeline</h3>
              <div className="table-wrapper">
                <table className="rate-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Carrier Event Code</th>
                      <th>Normalized Status</th>
                      <th>Description</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackingData.eventHistory.map((evt, idx) => (
                      <tr key={idx}>
                        <td style={{ fontSize: '0.8rem', color: '#a3a3a3' }}>
                          {new Date(evt.eventTime).toLocaleString()}
                        </td>
                        <td><code style={{ background: '#000000', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #262626' }}>{evt.carrierStatus}</code></td>
                        <td><span className="badge badge-status">{evt.normalizedStatus}</span></td>
                        <td>{evt.description || 'Status update recorded'}</td>
                        <td>{evt.location || 'Hub Facility'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
