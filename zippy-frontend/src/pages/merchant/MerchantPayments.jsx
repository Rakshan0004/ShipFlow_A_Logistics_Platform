import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner/LoadingSpinner';
import { paymentsApi } from '../../api/endpoints/payments';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

// ─── Badge helpers ──────────────────────────────────────────────────────────

const PAYMENT_STATUS_STYLES = {
  PAID:     { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
  PENDING:  { bg: 'rgba(245,158,11,0.12)',  color: '#d97706' },
  FAILED:   { bg: 'rgba(239,68,68,0.12)',   color: '#dc2626' },
  REFUNDED: { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1' },
};

const SETTLEMENT_STATUS_STYLES = {
  SETTLED:    { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
  PROCESSING: { bg: 'rgba(14,165,233,0.12)', color: '#0284c7' },
  PENDING:    { bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
};

const METHOD_STYLES = {
  COD:     { bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
  PREPAID: { bg: 'rgba(14,165,233,0.12)', color: '#0284c7' },
};

function Badge({ label, styles }) {
  if (!label) return null;
  const s = styles[label] || { bg: 'rgba(156,163,175,0.12)', color: '#6b7280' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.18rem 0.6rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 700,
      background: s.bg,
      color: s.color,
    }}>
      {label}
    </span>
  );
}

// ─── Summary Cards ──────────────────────────────────────────────────────────

function SummaryCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--neutral-200)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    }}>
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '0.78rem', color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
          {label}
        </div>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color || 'var(--neutral-900)', lineHeight: 1 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)', marginTop: '0.2rem' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── Filter Button ──────────────────────────────────────────────────────────

function FilterBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.35rem 0.9rem',
        borderRadius: 'var(--radius-md)',
        border: active ? '1.5px solid var(--primary-500)' : '1px solid var(--neutral-300)',
        background: active ? 'var(--primary-500)' : 'transparent',
        color: active ? '#fff' : 'var(--neutral-700)',
        fontWeight: active ? 700 : 500,
        fontSize: '0.82rem',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function MerchantPayments() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(true);

  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [settlementFilter, setSettlementFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchPayments = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      const res = await paymentsApi.getAll({
        page,
        size: 20,
        paymentStatus: paymentStatusFilter || undefined,
        settlementStatus: settlementFilter || undefined,
      });
      const data = res.data || res;
      // Spring Page response shape
      const content = data.content || data;
      setPayments(content);
      setPagination({
        page: data.number ?? 0,
        totalPages: data.totalPages ?? 1,
        totalElements: data.totalElements ?? content.length,
      });
    } catch (err) {
      showToast('Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  }, [paymentStatusFilter, settlementFilter]);

  useEffect(() => {
    fetchPayments(0);
  }, [fetchPayments]);

  // ── Client-side search on loaded page
  const displayed = search.trim()
    ? payments.filter(p =>
        p.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
        p.orderId?.toLowerCase().includes(search.toLowerCase()) ||
        p.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        p.customerName?.toLowerCase().includes(search.toLowerCase())
      )
    : payments;

  // ── Summary stats from current page data
  const totalRevenue = payments.reduce((s, p) => s + (parseFloat(p.totalAmount) || 0), 0);
  const paidCount   = payments.filter(p => p.paymentStatus === 'PAID').length;
  const pendingCount = payments.filter(p => p.paymentStatus === 'PENDING').length;
  const settledCount = payments.filter(p => p.settlementStatus === 'SETTLED').length;

  const thStyle = {
    padding: '0.75rem 1rem',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    color: 'var(--neutral-600)',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid var(--neutral-200)',
  };

  const tdStyle = {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: 'var(--neutral-800)',
    borderBottom: '1px solid var(--neutral-100)',
    verticalAlign: 'middle',
  };

  const monoStyle = {
    ...tdStyle,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--neutral-700)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

      {/* ── Page Header ── */}
      <div>
        <h1 style={{ margin: '0 0 0.35rem 0', fontSize: '1.75rem' }}>Payments & Settlements</h1>
        <p style={{ margin: 0, color: 'var(--neutral-600)' }}>
          View and track all payment records for your orders
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <SummaryCard icon="💰" label="Total Revenue (this page)" value={formatCurrency(totalRevenue)} color="var(--primary-600)" />
        <SummaryCard icon="✅" label="Paid" value={paidCount} sub="on this page" color="#059669" />
        <SummaryCard icon="⏳" label="Pending" value={pendingCount} sub="on this page" color="#d97706" />
        <SummaryCard icon="🏦" label="Settled" value={settledCount} sub="on this page" color="#0284c7" />
      </div>

      {/* ── Filters ── */}
      <Card>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>

          {/* Payment Status filter */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Payment Status
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map(s => (
                <FilterBtn key={s} active={paymentStatusFilter === s} onClick={() => setPaymentStatusFilter(s)}>
                  {s || 'All'}
                </FilterBtn>
              ))}
            </div>
          </div>

          {/* Settlement Status filter */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Settlement
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['', 'SETTLED', 'PROCESSING', 'PENDING'].map(s => (
                <FilterBtn key={s} active={settlementFilter === s} onClick={() => setSettlementFilter(s)}>
                  {s || 'All'}
                </FilterBtn>
              ))}
            </div>
          </div>

          {/* Search */}
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginBottom: '0.4rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Search
            </div>
            <input
              type="text"
              placeholder="Transaction ID, Order ID, Invoice…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '0.4rem 0.85rem',
                border: '1px solid var(--neutral-300)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                width: '240px',
                outline: 'none',
                color: 'var(--neutral-900)',
                background: 'var(--surface)',
              }}
            />
          </div>
        </div>
      </Card>

      {/* ── Payments Table ── */}
      <Card>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <LoadingSpinner size="md" label="Loading payments…" />
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-500)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
            <p>No payments found for the selected filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Transaction ID</th>
                  <th style={thStyle}>Invoice #</th>
                  <th style={thStyle}>Order ID</th>
                  <th style={thStyle}>Customer</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Amount</th>
                  <th style={thStyle}>Method</th>
                  <th style={thStyle}>Pay Status</th>
                  <th style={thStyle}>Settlement</th>
                  <th style={thStyle}>Settled On</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(p => (
                  <tr key={p.transactionId} style={{ transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--neutral-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={monoStyle}>{p.transactionId}</td>
                    <td style={monoStyle}>{p.invoiceNumber}</td>
                    <td style={monoStyle}>
                      <button
                        onClick={() => navigate(`/merchant/orders/${p.orderId}`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-600)', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: 0 }}
                      >
                        {p.orderId}
                      </button>
                    </td>
                    <td style={tdStyle}>{p.customerName || '—'}</td>
                    <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700 }}>
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td style={tdStyle}>
                      <Badge label={p.paymentMethod} styles={METHOD_STYLES} />
                    </td>
                    <td style={tdStyle}>
                      <Badge label={p.paymentStatus} styles={PAYMENT_STATUS_STYLES} />
                    </td>
                    <td style={tdStyle}>
                      <Badge label={p.settlementStatus} styles={SETTLEMENT_STATUS_STYLES} />
                    </td>
                    <td style={{ ...tdStyle, fontSize: '0.8rem', color: 'var(--neutral-500)' }}>
                      {p.settlementDate ? formatDate(p.settlementDate) : '—'}
                    </td>
                    <td style={tdStyle}>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate(`/merchant/orders/${p.orderId}`)}
                      >
                        View Order
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        {!loading && pagination.totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 0 0 0',
            borderTop: '1px solid var(--neutral-100)',
            marginTop: '0.75rem',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--neutral-500)' }}>
              Page {pagination.page + 1} of {pagination.totalPages} ({pagination.totalElements} total)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPayments(pagination.page - 1)}
                disabled={pagination.page === 0}
              >
                ← Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPayments(pagination.page + 1)}
                disabled={pagination.page + 1 >= pagination.totalPages}
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
