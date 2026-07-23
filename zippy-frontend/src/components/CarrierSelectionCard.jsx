import React from 'react';

export default function CarrierSelectionCard({ selection, onCreateShipment, creatingShipment }) {
  if (!selection) return null;

  const { selectedCarrier } = selection;

  return (
    <div className="card" style={{ borderColor: 'rgba(99, 102, 241, 0.5)', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-status" style={{ marginBottom: '0.5rem' }}>CARRIER SELECTED & PRICE FROZEN</span>
          <h2 className="card-title" style={{ margin: 0 }}>
            {selectedCarrier.serviceName} ({selectedCarrier.carrierCode})
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Guaranteed Rate: <strong style={{ color: '#a5b4fc', fontSize: '1.1rem' }}>₹{Number(selectedCarrier.quotedAmount).toFixed(2)}</strong>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={onCreateShipment}
          disabled={creatingShipment}
          style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
        >
          {creatingShipment ? 'Generating AWB & Booking...' : '📦 Confirm & Create Shipment →'}
        </button>
      </div>
    </div>
  );
}
