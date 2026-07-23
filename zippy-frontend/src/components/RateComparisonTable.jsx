import React from 'react';

export default function RateComparisonTable({
  rateResponse,
  loading,
  sortBy,
  setSortBy,
  onSelectCarrier,
  selectingCarrier
}) {
  if (loading) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          🔍 Querying FastShip, QuickExpress, and ReliableCourier in parallel...
        </div>
      </div>
    );
  }

  if (!rateResponse) return null;

  const { orderId, shippingOptions = [], warnings = [] } = rateResponse;

  // Identify cheapest and fastest
  const cheapestPrice = shippingOptions.length > 0
    ? Math.min(...shippingOptions.map(o => o.totalCharge))
    : null;

  const fastestSpeed = shippingOptions.length > 0
    ? Math.min(...shippingOptions.map(o => o.estimatedMinDays))
    : null;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="card-title">🚀 Available Courier Rates</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Zippy Order ID: <strong style={{ color: '#a5b4fc' }}>{orderId}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort by:</label>
          <select
            className="form-control"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '0.4rem 0.8rem', width: 'auto' }}
          >
            <option value="price">Lowest Price</option>
            <option value="speed">Fastest Delivery</option>
            <option value="carrier">Carrier Name</option>
          </select>
        </div>
      </div>

      {warnings.length > 0 && (
        <div>
          {warnings.map((w, idx) => (
            <div key={idx} className="alert-warning">
              ⚠️ <strong>{w.carrierCode} Warning:</strong> {w.message}
            </div>
          ))}
        </div>
      )}

      {shippingOptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-rose)' }}>
          ❌ All courier integrations failed or returned no rates.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="rate-table">
            <thead>
              <tr>
                <th>Courier & Service</th>
                <th>Estimated ETA</th>
                <th>Base Freight</th>
                <th>COD & Extra</th>
                <th>Tax</th>
                <th>Total Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shippingOptions.map((opt, idx) => {
                const isCheapest = opt.totalCharge === cheapestPrice;
                const isFastest = opt.estimatedMinDays === fastestSpeed;

                return (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{opt.carrierName}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{opt.serviceName} ({opt.serviceCode})</div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem' }}>
                        {isCheapest && <span className="badge badge-cheapest">BEST PRICE</span>}
                        {isFastest && <span className="badge badge-fastest">FASTEST</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {opt.estimatedMinDays === opt.estimatedMaxDays
                          ? `${opt.estimatedMinDays} Days`
                          : `${opt.estimatedMinDays} - ${opt.estimatedMaxDays} Days`}
                      </div>
                    </td>
                    <td>₹{Number(opt.baseCharge).toFixed(2)}</td>
                    <td>
                      <div>COD: ₹{Number(opt.codCharge).toFixed(2)}</div>
                      {Number(opt.additionalCharges) > 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                          Fuel: ₹{Number(opt.additionalCharges).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>₹{Number(opt.tax).toFixed(2)}</td>
                    <td>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#a5b4fc' }}>
                        ₹{Number(opt.totalCharge).toFixed(2)}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn-primary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => onSelectCarrier(opt)}
                        disabled={selectingCarrier}
                      >
                        Select Courier →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
