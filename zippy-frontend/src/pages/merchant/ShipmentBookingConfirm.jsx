import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import { ordersApi } from '../../api/endpoints/orders';
import { ratesApi } from '../../api/endpoints/rates';
import { shipmentsApi } from '../../api/endpoints/shipments';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CARRIER_NAMES } from '../../utils/constants';

// ─── Row helper ─────────────────────────────────────────────────────────────

function Row({ label, value, bold, accent, large, muted, separator }) {
  return (
    <>
      {separator && (
        <div style={{ borderTop: '1px solid var(--neutral-200)', margin: '0.5rem 0' }} />
      )}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.5rem 0',
      }}>
        <span style={{ color: muted ? 'var(--neutral-400)' : 'var(--neutral-600)', fontSize: '0.9rem' }}>
          {label}
        </span>
        <span style={{
          fontWeight: bold || large ? 700 : 500,
          fontSize: large ? '1.15rem' : '0.95rem',
          color: accent ? 'var(--primary-600)' : bold ? 'var(--neutral-900)' : 'var(--neutral-800)',
        }}>
          {value}
        </span>
      </div>
    </>
  );
}

// ─── Info field ──────────────────────────────────────────────────────────────

function InfoField({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--neutral-800)' }}>{value}</div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ShipmentBookingConfirm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  // The selected carrier option is passed via router state from RateComparison
  const selectedOption = location.state?.selectedOption;

  useEffect(() => {
    if (!selectedOption) {
      // No carrier selected — go back to rates
      navigate(`/merchant/orders/${id}/rates`, { replace: true });
      return;
    }
    ordersApi.getById(id)
      .then(res => setOrder(res.data || res))
      .catch(() => {
        showToast('Could not load order details', 'error');
        navigate('/merchant/orders');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    setBooking(true);
    try {
      await ratesApi.selectCarrier(id, {
        carrierCode: selectedOption.carrierCode,
        serviceCode: selectedOption.serviceCode,
        quotedAmount: selectedOption.totalCharge,
      });
      try {
        await shipmentsApi.create(id);
        showToast('Shipment booked! AWB generated successfully.', 'success');
      } catch {
        showToast('Carrier confirmed. Shipment booking pending.', 'warning');
      }
      navigate(`/merchant/orders/${id}`);
    } catch (err) {
      showToast(err.message || 'Booking failed. Please try again.', 'error');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size="lg" label="Loading order details…" />
      </div>
    );
  }

  if (!order || !selectedOption) return null;

  const isCOD = order.paymentType === 'COD';
  const codAmount = parseFloat(order.codAmount || 0);
  const freightTotal = parseFloat(selectedOption.totalCharge || 0);
  const merchantOwes = freightTotal; // Merchant pays courier freight; COD is collected from customer

  const pickupCity = order.pickupAddress?.city;
  const deliveryCity = order.deliveryAddress?.city;
  const packageWeight = order.package?.weightGrams;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="outline" size="sm" onClick={() => navigate(`/merchant/orders/${id}/rates`)}>
          ← Back to Rates
        </Button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Confirm &amp; Book Shipment</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
            Review all charges before confirming. This action is irreversible.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>

        {/* ── Left Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Order & Customer Info */}
          <Card title="📦 Order Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-600)', fontSize: '1rem' }}>
                  {order.orderId}
                </span>
                <StatusBadge status={order.orderStatus} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <InfoField label="Merchant Ref" value={order.merchantOrderId} />
                <InfoField label="Payment Type" value={order.paymentType} />
                <InfoField label="Customer" value={order.customer?.name} />
                <InfoField label="Phone" value={order.customer?.phone} />
              </div>

              <div style={{ borderTop: '1px solid var(--neutral-100)', paddingTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Pickup</div>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {order.pickupAddress?.addressLine1}<br />
                    <span style={{ color: 'var(--neutral-600)' }}>{order.pickupAddress?.city}, {order.pickupAddress?.pincode}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Delivery</div>
                  <div style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                    {order.deliveryAddress?.addressLine1}<br />
                    <span style={{ color: 'var(--neutral-600)' }}>{order.deliveryAddress?.city}, {order.deliveryAddress?.pincode}</span>
                  </div>
                </div>
              </div>

              {packageWeight && (
                <div style={{ borderTop: '1px solid var(--neutral-100)', paddingTop: '0.75rem', display: 'flex', gap: '1.5rem' }}>
                  <InfoField label="Package Weight" value={`${packageWeight} g (${(packageWeight / 1000).toFixed(2)} kg)`} />
                  {order.package?.lengthCm && (
                    <InfoField
                      label="Dimensions"
                      value={`${order.package.lengthCm} × ${order.package.widthCm} × ${order.package.heightCm} cm`}
                    />
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Carrier Details */}
          <Card title="🚚 Selected Courier">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <InfoField label="Carrier" value={selectedOption.carrierName} />
              <InfoField label="Service" value={`${selectedOption.serviceName} (${selectedOption.serviceCode})`} />
              <InfoField
                label="Estimated Delivery"
                value={
                  selectedOption.estimatedMinDays === selectedOption.estimatedMaxDays
                    ? `${selectedOption.estimatedMinDays} Business Days`
                    : `${selectedOption.estimatedMinDays}–${selectedOption.estimatedMaxDays} Business Days`
                }
              />
              <InfoField label="Route" value={pickupCity && deliveryCity ? `${pickupCity} → ${deliveryCity}` : '—'} />
            </div>
          </Card>
        </div>

        {/* ── Right Column — Cost Summary ── */}
        <div>
          <Card title="💰 Complete Cost Summary">
            <div style={{ display: 'flex', flexDirection: 'column' }}>

              {/* Product value */}
              <div style={{
                padding: '0.75rem 1rem',
                background: isCOD ? 'rgba(245,158,11,0.08)' : 'rgba(14,165,233,0.08)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                border: `1px solid ${isCOD ? 'rgba(245,158,11,0.2)' : 'rgba(14,165,233,0.2)'}`,
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {isCOD ? 'COD — Collected from Customer on Delivery' : 'Prepaid — Already Paid by Customer'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isCOD ? '#d97706' : '#0284c7' }}>
                  {isCOD ? formatCurrency(codAmount) : 'Paid Online'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', marginTop: '0.2rem' }}>
                  Product / order collection value
                </div>
              </div>

              {/* Courier Freight Breakdown */}
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--neutral-500)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Courier Freight (charged by {selectedOption.carrierName})
              </div>

              <Row label="Base Freight" value={formatCurrency(selectedOption.baseCharge)} />
              {Number(selectedOption.codCharge) > 0 && (
                <Row label="COD Handling Fee" value={formatCurrency(selectedOption.codCharge)} />
              )}
              {Number(selectedOption.additionalCharges) > 0 && (
                <Row label="Fuel Surcharge" value={formatCurrency(selectedOption.additionalCharges)} muted />
              )}
              <Row label="Tax (18% GST)" value={formatCurrency(selectedOption.tax)} muted />
              <Row
                label="Total Courier Freight"
                value={formatCurrency(freightTotal)}
                bold
                separator
              />

              {/* What merchant pays */}
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(14,165,233,0.06)',
                border: '1.5px solid var(--primary-400)',
                borderRadius: 'var(--radius-md)',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-600)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
                  You pay to courier partner
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-600)' }}>
                  {formatCurrency(merchantOwes)}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', marginTop: '0.3rem' }}>
                  Courier freight only — product value is {isCOD ? 'remitted to you after delivery' : 'already collected'}
                </div>
              </div>

              {/* CTA */}
              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button
                  variant="primary"
                  size="lg"
                  loading={booking}
                  onClick={handleConfirm}
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700 }}
                >
                  {booking ? 'Booking Shipment…' : `✓ Confirm & Book with ${selectedOption.carrierName}`}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/merchant/orders/${id}/rates`)}
                  style={{ width: '100%' }}
                >
                  ← Choose a Different Courier
                </Button>
              </div>

              <p style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', textAlign: 'center', marginTop: '0.75rem' }}>
                Confirming will freeze this rate and generate the AWB shipping label.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
