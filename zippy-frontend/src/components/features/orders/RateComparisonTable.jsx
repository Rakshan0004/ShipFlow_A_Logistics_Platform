import React from 'react';
import Card from '../../ui/Card/Card';
import Button from '../../ui/Button/Button';
import Select from '../../ui/Select/Select';
import Badge from '../../ui/Badge/Badge';
import LoadingSpinner from '../../ui/LoadingSpinner/LoadingSpinner';
import { formatCurrency } from '../../../utils/formatters';

export default function RateComparisonTable({
  rateResponse,
  loading,
  sortBy,
  setSortBy,
  onSelectCarrier,
}) {

  if (loading) {
    return (
      <Card style={{ textAlign: 'center', padding: '3.5rem' }}>
        <LoadingSpinner size="lg" label="Querying FastShip, QuickExpress, and ReliableCourier rates in parallel..." />
        <p style={{ color: 'var(--neutral-500)', marginTop: '1rem', fontSize: '0.9rem' }}>
          Fetching real-time shipping options and calculating COD fees...
        </p>
      </Card>
    );
  }

  if (!rateResponse) return null;

  const { orderId, shippingOptions = [], warnings = [] } = rateResponse;

  const cheapestPrice = shippingOptions.length > 0
    ? Math.min(...shippingOptions.map(o => o.totalCharge))
    : null;

  const fastestSpeed = shippingOptions.length > 0
    ? Math.min(...shippingOptions.map(o => o.estimatedMinDays))
    : null;



  return (
    <Card 
      title={`🚀 Available Courier Rates for Order: ${orderId}`}
      headerExtra={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--neutral-500)' }}>Sort by:</span>
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'price', label: 'Lowest Price' },
              { value: 'speed', label: 'Fastest Delivery' },
              { value: 'carrier', label: 'Carrier Name' }
            ]}
          />
        </div>
      }
    >
      {warnings.length > 0 && (
        <div style={{ marginBottom: '1.25rem' }}>
          {warnings.map((w, idx) => (
            <div 
              key={idx} 
              style={{
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid var(--warning)',
                color: 'var(--warning)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                marginBottom: '0.5rem'
              }}
            >
              ⚠️ <strong>{w.carrierCode} Warning:</strong> {w.message}
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: 'rgba(14, 165, 233, 0.08)',
        borderLeft: '4px solid var(--primary-500)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.85rem',
        color: 'var(--neutral-700)',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        ℹ️ <span><strong>Courier Freight Rates:</strong> Comparing delivery costs charged by courier partners for order <strong>{orderId}</strong>. Product value is collected separately upon delivery.</span>
      </div>

      {shippingOptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--error)' }}>
          ❌ All courier integrations failed or returned no valid shipping rates for this pincode route.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--neutral-200)', color: 'var(--neutral-500)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Courier &amp; Service</th>
                <th style={{ padding: '0.75rem 1rem' }}>ETA</th>
                <th style={{ padding: '0.75rem 1rem' }}>Base Freight</th>
                <th style={{ padding: '0.75rem 1rem' }}>COD Fee &amp; Surcharges</th>
                <th style={{ padding: '0.75rem 1rem' }}>Tax (18% GST)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Total Courier Freight</th>
                <th style={{ padding: '0.75rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shippingOptions.map((opt, idx) => {
                const isCheapest = opt.totalCharge === cheapestPrice;
                const isFastest = opt.estimatedMinDays === fastestSpeed;

                return (
                  <tr 
                    key={idx}
                    style={{ 
                      borderBottom: '1px solid var(--neutral-200)',
                      transition: 'background-color var(--transition-fast)'
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--neutral-950)' }}>{opt.carrierName}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--neutral-500)' }}>{opt.serviceName} ({opt.serviceCode})</div>
                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                        {isCheapest && <Badge variant="success">BEST PRICE</Badge>}
                        {isFastest && <Badge variant="info">FASTEST</Badge>}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--neutral-900)' }}>
                      {opt.estimatedMinDays === opt.estimatedMaxDays
                        ? `${opt.estimatedMinDays} Days`
                        : `${opt.estimatedMinDays} - ${opt.estimatedMaxDays} Days`}
                    </td>
                    <td style={{ padding: '1rem' }}>{formatCurrency(opt.baseCharge)}</td>
                    <td style={{ padding: '1rem' }}>
                      <div>COD: {formatCurrency(opt.codCharge)}</div>
                      {Number(opt.additionalCharges) > 0 && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--neutral-500)' }}>
                          Fuel: {formatCurrency(opt.additionalCharges)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>{formatCurrency(opt.tax)}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-500)' }}>
                        {formatCurrency(opt.totalCharge)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => onSelectCarrier(opt)}
                      >
                        Select Courier →
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </Card>
  );
}
