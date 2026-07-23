import React from 'react';

export default function ShipmentCard({ shipmentData }) {
  if (!shipmentData) return null;

  const { shipment, orderId, orderStatus } = shipmentData;

  return (
    <div className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <span className="badge badge-cheapest" style={{ marginBottom: '0.5rem' }}>SHIPMENT CREATED & BOOKED</span>
          <h2 className="card-title" style={{ margin: 0 }}>
            {shipment.carrierCode} Shipment
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Zippy Order</div>
          <div style={{ fontWeight: 700, color: '#a5b4fc' }}>{orderId}</div>
        </div>
      </div>

      <div className="form-grid" style={{ gap: '1rem', background: '#0f172a', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carrier Booking ID</span>
          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{shipment.carrierShipmentId}</div>
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>AWB / Tracking Number</span>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#38bdf8', letterSpacing: '0.05em' }}>
            {shipment.trackingNumber}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Service Code</span>
          <div style={{ fontWeight: 600 }}>{shipment.serviceCode}</div>
        </div>

        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Charged</span>
          <div style={{ fontWeight: 700, color: '#34d399' }}>₹{Number(shipment.quotedAmount).toFixed(2)}</div>
        </div>
      </div>

      {shipment.labelUrl && (
        <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
          <a
            href={shipment.labelUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            📄 View / Download Shipping Label
          </a>
        </div>
      )}
    </div>
  );
}
