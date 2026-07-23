import React from 'react';

const STAGES = [
  { id: 'SHIPMENT_CREATED', label: 'Created', icon: '📝' },
  { id: 'PICKED_UP', label: 'Picked Up', icon: '📦' },
  { id: 'IN_TRANSIT', label: 'In Transit', icon: '🚚' },
  { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵' },
  { id: 'DELIVERED', label: 'Delivered', icon: '🎉' }
];

export default function TrackingTimeline({ currentStatus }) {
  const currentIdx = STAGES.findIndex(s => s.id === currentStatus);
  const activeIndex = currentIdx >= 0 ? currentIdx : 0;
  const progressPercent = (activeIndex / (STAGES.length - 1)) * 100;

  return (
    <div className="card">
      <h2 className="card-title">📍 Live Tracking Timeline</h2>

      <div style={{ padding: '1rem 0' }}>
        <div className="timeline-wrapper">
          <div className="timeline-line">
            <div className="timeline-line-progress" style={{ width: `${progressPercent}%` }} />
          </div>

          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;

            return (
              <div
                key={stage.id}
                className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="step-node">
                  {isCompleted ? '✓' : stage.icon}
                </div>
                <div className="step-label">{stage.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {currentStatus === 'DELIVERY_FAILED' && (
        <div className="alert-warning" style={{ margin: 0, background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fda4af' }}>
          ⚠️ <strong>Delivery Failed:</strong> The courier attempted delivery but was unsuccessful.
        </div>
      )}

      {currentStatus === 'RTO' && (
        <div className="alert-warning" style={{ margin: 0, background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fcd34d' }}>
          ↩️ <strong>Returned to Origin (RTO):</strong> Shipment is returning to merchant pickup location.
        </div>
      )}
    </div>
  );
}
