import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner/LoadingSpinner';
import OrderSummaryCard from '../../components/features/orders/OrderSummaryCard';
import CustomerInfoCard from '../../components/features/orders/CustomerInfoCard';
import AddressCard from '../../components/features/orders/AddressCard';
import StatusTimeline from '../../components/features/orders/StatusTimeline';
import { ordersApi } from '../../api/endpoints/orders';
import { trackingApi } from '../../api/endpoints/tracking';
import { paymentsApi } from '../../api/endpoints/payments';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, formatDate, formatWeight } from '../../utils/formatters';
import { CARRIER_NAMES } from '../../utils/constants';

// ─── Package Details Card ───────────────────────────────────────────────────

function PackageDetailsCard({ packageInfo }) {
  if (!packageInfo) return null;

  const weight = packageInfo.weightGrams;
  const length = packageInfo.lengthCm;
  const width = packageInfo.widthCm;
  const height = packageInfo.heightCm;

  const weightKg = weight ? (weight / 1000).toFixed(3) : null;

  // Volumetric weight = L × W × H / 5000 (industry standard divisor)
  const volumetricKg =
    length && width && height
      ? ((length * width * height) / 5000).toFixed(3)
      : null;

  const chargeableKg =
    weightKg && volumetricKg
      ? Math.max(parseFloat(weightKg), parseFloat(volumetricKg)).toFixed(3)
      : weightKg;

  const infoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  };

  const labelStyle = {
    fontSize: '0.72rem',
    color: 'var(--neutral-500)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const valueStyle = {
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--neutral-900)',
  };

  return (
    <Card title="📦 Package Details">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <div style={infoStyle}>
          <span style={labelStyle}>Weight (actual)</span>
          <span style={valueStyle}>{weight ? `${weight} g` : 'N/A'}</span>
          {weightKg && (
            <span style={{ fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
              = {weightKg} kg
            </span>
          )}
        </div>

        <div style={infoStyle}>
          <span style={labelStyle}>Dimensions (L × W × H)</span>
          <span style={valueStyle}>
            {length && width && height
              ? `${length} × ${width} × ${height} cm`
              : 'Not provided'}
          </span>
        </div>

        {volumetricKg && (
          <div style={infoStyle}>
            <span style={labelStyle}>Volumetric Weight</span>
            <span style={valueStyle}>{volumetricKg} kg</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--neutral-500)' }}>
              L×W×H ÷ 5000
            </span>
          </div>
        )}

        {chargeableKg && (
          <div style={infoStyle}>
            <span style={labelStyle}>Chargeable Weight</span>
            <span
              style={{
                ...valueStyle,
                color: 'var(--primary-600)',
              }}
            >
              {chargeableKg} kg
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--neutral-500)' }}>
              Higher of actual / volumetric
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Payment Info Card ──────────────────────────────────────────────────────

function paymentStatusColor(status) {
  switch (status) {
    case 'PAID':
      return { bg: 'rgba(16,185,129,0.12)', color: '#059669' };
    case 'PENDING':
      return { bg: 'rgba(245,158,11,0.12)', color: '#d97706' };
    case 'FAILED':
      return { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' };
    case 'REFUNDED':
      return { bg: 'rgba(99,102,241,0.12)', color: '#6366f1' };
    default:
      return { bg: 'rgba(156,163,175,0.12)', color: '#6b7280' };
  }
}

function settlementStatusColor(status) {
  switch (status) {
    case 'SETTLED':
      return { bg: 'rgba(16,185,129,0.12)', color: '#059669' };
    case 'PROCESSING':
      return { bg: 'rgba(14,165,233,0.12)', color: '#0284c7' };
    default:
      return { bg: 'rgba(245,158,11,0.12)', color: '#d97706' };
  }
}

function InlineBadge({ label, colors }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.65rem',
        borderRadius: '999px',
        fontSize: '0.78rem',
        fontWeight: 700,
        background: colors.bg,
        color: colors.color,
        letterSpacing: '0.03em',
      }}
    >
      {label}
    </span>
  );
}

function PaymentInfoCard({ payment, loading }) {
  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.55rem 0',
    borderBottom: '1px solid var(--neutral-100)',
    fontSize: '0.9rem',
  };

  const labelStyle = { color: 'var(--neutral-600)' };
  const valueStyle = { fontWeight: 600, color: 'var(--neutral-900)' };
  const monoStyle = {
    ...valueStyle,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
  };

  if (loading) {
    return (
      <Card title="💳 Payment Details">
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
          Loading payment info…
        </div>
      </Card>
    );
  }

  if (!payment) {
    return (
      <Card title="💳 Payment Details">
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--neutral-500)' }}>
          Payment information not available yet.
        </div>
      </Card>
    );
  }

  return (
    <Card title="💳 Payment Details">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* IDs */}
        <div style={rowStyle}>
          <span style={labelStyle}>Transaction ID</span>
          <span style={monoStyle}>{payment.transactionId}</span>
        </div>
        <div style={{ ...rowStyle, marginBottom: '0.75rem' }}>
          <span style={labelStyle}>Invoice Number</span>
          <span style={monoStyle}>{payment.invoiceNumber}</span>
        </div>

        {/* Amount Breakdown */}
        <div style={rowStyle}>
          <span style={labelStyle}>Order Amount</span>
          <span style={valueStyle}>{formatCurrency(payment.orderAmount)}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Shipping Charges</span>
          <span style={valueStyle}>{formatCurrency(payment.shippingCharges)}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Tax (18% GST on shipping)</span>
          <span style={valueStyle}>{formatCurrency(payment.tax)}</span>
        </div>
        <div
          style={{
            ...rowStyle,
            borderBottom: 'none',
            paddingTop: '0.75rem',
            marginTop: '0.25rem',
            borderTop: '2px solid var(--neutral-200)',
            marginBottom: '1rem',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Total Amount</span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--primary-600)',
            }}
          >
            {formatCurrency(payment.totalAmount)}
          </span>
        </div>

        {/* Status Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            padding: '0.75rem 0',
            borderTop: '1px solid var(--neutral-100)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              Payment Method
            </div>
            <InlineBadge
              label={payment.paymentMethod}
              colors={
                payment.paymentMethod === 'COD'
                  ? { bg: 'rgba(245,158,11,0.12)', color: '#d97706' }
                  : { bg: 'rgba(14,165,233,0.12)', color: '#0284c7' }
              }
            />
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              Payment Status
            </div>
            <InlineBadge
              label={payment.paymentStatus}
              colors={paymentStatusColor(payment.paymentStatus)}
            />
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              Settlement
            </div>
            <InlineBadge
              label={payment.settlementStatus}
              colors={settlementStatusColor(payment.settlementStatus)}
            />
          </div>

          {payment.settlementDate && (
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                Settlement Date
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {formatDate(payment.settlementDate)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MerchantOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getById(id);
      const data = res.data || res;
      setOrder(data);

      // Tracking events (non-blocking)
      try {
        const trackRes = await trackingApi.getByOrderId(id);
        setTrackingInfo(trackRes.data || trackRes);
      } catch (_) {
        // No tracking yet — fine
      }

      // Payment (non-blocking, lazy generated on backend)
      setPaymentLoading(true);
      try {
        const payRes = await paymentsApi.getByOrderId(id);
        setPayment(payRes.data || payRes);
      } catch (_) {
        // Payment generation failed silently
      } finally {
        setPaymentLoading(false);
      }
    } catch (err) {
      showToast(`Order ${id} not found`, 'error');
      navigate('/merchant/orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner size="lg" label="Loading order details…" />
      </div>
    );
  }

  if (!order) return null;

  const carrierCode = order.selectedCarrierCode || trackingInfo?.carrierCode;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={() => navigate('/merchant/orders')}>
            ← Back to Orders
          </Button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
              Order: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-600)' }}>{order.orderId}</span>
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
              Created {formatDate(order.createdAt, 'long')}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <StatusBadge status={order.orderStatus} />
          {order.orderStatus === 'ORDER_CREATED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/merchant/orders/${order.orderId}/rates`)}
            >
              ⚡ Select Courier
            </Button>
          )}
          {trackingInfo?.trackingNumber && (
            <Link to={`/tracking/public/${trackingInfo.trackingNumber}`}>
              <Button variant="outline" size="sm">🔍 Public Tracking</Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Order Summary ── */}
      <OrderSummaryCard order={order} />

      {/* ── Customer + Addresses ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <CustomerInfoCard customer={order.customer} />
        <AddressCard pickupAddress={order.pickupAddress} deliveryAddress={order.deliveryAddress} />
      </div>

      {/* ── Package Details ── */}
      <PackageDetailsCard packageInfo={order.package} />

      {/* ── Courier & Shipment ── */}
      {carrierCode && (
        <Card title="🚚 Courier & Shipment">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Carrier
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-600)' }}>
                {CARRIER_NAMES[carrierCode] || carrierCode}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                AWB / Tracking Number
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600 }}>
                {trackingInfo?.trackingNumber || order.shipment?.awbNumber || 'Generating…'}
              </div>
            </div>

            {order.selectedServiceCode && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Service Type
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                  {order.selectedServiceCode}
                </div>
              </div>
            )}

            {trackingInfo?.estimatedDelivery && (
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--neutral-500)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Est. Delivery
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--success)' }}>
                  {trackingInfo.estimatedDelivery}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── Payment Details ── */}
      <PaymentInfoCard payment={payment} loading={paymentLoading} />

      {/* ── Tracking Timeline ── */}
      <StatusTimeline
        currentStatus={order.orderStatus}
        events={trackingInfo?.events || order.statusHistory || []}
        order={order}
      />
    </div>
  );
}
