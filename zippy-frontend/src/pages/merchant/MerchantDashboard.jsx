import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Wallet, 
  FileText,
  Search,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

import Card from '../../components/ui/Card/Card';
import Button from '../../components/ui/Button/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge/StatusBadge';
import { ordersApi } from '../../api/endpoints/orders';
import { paymentsApi } from '../../api/endpoints/payments';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_COLORS = {
  Created: '#64748b',
  'In Transit': '#0ea5e9',
  Delivered: '#10b981',
  Exceptions: '#f43f5e'
};

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState({ pie: [], bar: [] });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch both orders and payments in parallel for rich analytics
      const [ordersRes, paymentsRes] = await Promise.all([
        ordersApi.getAll(),
        paymentsApi.getAll({ size: 100 }) // fetch first 100 payments for aggregation
      ]);

      const orders = ordersRes.data || ordersRes || [];
      const payments = paymentsRes?.data?.content || paymentsRes?.content || [];

      // 1. KPI Calculations
      const totalOrders = orders.length;
      
      const activeShipments = orders.filter(o =>
        ['CARRIER_SELECTED', 'SHIPMENT_CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)
      ).length;

      const deliveredCount = orders.filter(o => o.orderStatus === 'DELIVERED').length;
      const exceptionCount = orders.filter(o => ['RTO', 'CANCELLED', 'DELIVERY_FAILED'].includes(o.orderStatus)).length;
      const createdCount = totalOrders - activeShipments - deliveredCount - exceptionCount;

      // Financials from Payments
      let pendingSettlements = 0;
      let totalFreightSpend = 0;

      payments.forEach(p => {
        // Calculate pending remittances (COD amount minus courier freight)
        if (p.paymentMethod === 'COD' && p.settlementStatus === 'PENDING' && p.paymentStatus !== 'FAILED') {
          pendingSettlements += (p.orderAmount - (p.totalAmount || 0));
        }
        
        // Calculate total spent on shipping
        if (p.totalAmount) {
          totalFreightSpend += p.totalAmount;
        }
      });

      setStats({
        totalOrders,
        activeShipments,
        pendingSettlements,
        totalFreightSpend
      });

      // 2. Chart Data Prep
      const pieData = [
        { name: 'Created', value: createdCount },
        { name: 'In Transit', value: activeShipments },
        { name: 'Delivered', value: deliveredCount },
        { name: 'Exceptions', value: exceptionCount }
      ].filter(d => d.value > 0);

      // Financial Bar Chart (Last 5 Delivered/Transit Payments)
      const barData = payments
        .filter(p => p.orderAmount > 0)
        .slice(0, 5)
        .map(p => ({
          name: p.orderId.replace('ZPY-ORD-', '#'),
          Revenue: p.orderAmount,
          Freight: p.totalAmount
        }));

      setChartData({ pie: pieData, bar: barData });
      
      // 3. Recent Orders
      setRecentOrders(orders.slice(0, 5));

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      showToast('Failed to load comprehensive analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoadingSpinner size="lg" label="Aggregating platform analytics..." />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0', color: 'var(--neutral-900)' }}>
            Operations &amp; Analytics
          </h1>
          <p style={{ color: 'var(--neutral-500)', margin: 0, fontSize: '0.95rem' }}>
            Monitor your logistics performance and financial settlements in real-time.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/merchant/orders/new')}
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}
        >
          <Package size={18} />
          Create Shipment
        </Button>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <Card style={{ borderLeft: '4px solid var(--primary-500)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Total Shipments
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                {stats?.totalOrders || 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--primary-50)', borderRadius: '12px', color: 'var(--primary-600)' }}>
              <Package size={24} />
            </div>
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Active in Transit
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                {stats?.activeShipments || 0}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', color: 'var(--warning)' }}>
              <Truck size={24} />
            </div>
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Pending Settlements
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                {formatCurrency(stats?.pendingSettlements || 0)}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: 'var(--success)' }}>
              <Wallet size={24} />
            </div>
          </div>
        </Card>

        <Card style={{ borderLeft: '4px solid var(--neutral-400)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Total Freight Spend
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--neutral-900)' }}>
                {formatCurrency(stats?.totalFreightSpend || 0)}
              </div>
            </div>
            <div style={{ padding: '0.75rem', background: 'var(--neutral-100)', borderRadius: '12px', color: 'var(--neutral-500)' }}>
              <CreditCard size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Visual Analytics ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* Order Status Funnel */}
        <Card title="Shipment Funnel" style={{ minHeight: '350px' }}>
          {chartData.pie.length > 0 ? (
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.pie}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.pie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => [`${value} Orders`, 'Volume']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-400)' }}>
              No data available
            </div>
          )}
        </Card>

        {/* Financial Overview */}
        <Card title="Product Revenue vs Freight Cost" style={{ minHeight: '350px' }}>
           {chartData.bar.length > 0 ? (
            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.bar} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--neutral-200)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--neutral-500)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--neutral-500)' }} tickFormatter={(val) => `₹${val}`} />
                  <RechartsTooltip 
                    cursor={{ fill: 'var(--neutral-50)' }}
                    formatter={(value) => [formatCurrency(value)]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                  <Bar dataKey="Revenue" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Freight" fill="var(--primary-400)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-400)' }}>
              No financial data generated yet
            </div>
          )}
        </Card>
      </div>

      {/* ── Quick Actions Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Button variant="outline" onClick={() => navigate('/merchant/orders/new')} style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <Package size={20} color="var(--primary-600)" /> <span>New Order</span>
        </Button>
        <Button variant="outline" onClick={() => navigate('/merchant/orders')} style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <FileText size={20} color="var(--primary-600)" /> <span>All Orders</span>
        </Button>
        <Button variant="outline" onClick={() => navigate('/merchant/tracking')} style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <Search size={20} color="var(--primary-600)" /> <span>Track Package</span>
        </Button>
        <Button variant="outline" onClick={() => navigate('/merchant/payments')} style={{ padding: '1.25rem', display: 'flex', gap: '0.75rem' }}>
          <Wallet size={20} color="var(--primary-600)" /> <span>Settlements</span>
        </Button>
      </div>

      {/* ── Recent Orders Table ── */}
      <Card
        title="Recent Shipments"
        headerExtra={
          <Button variant="link" size="sm" onClick={() => navigate('/merchant/orders')}>
            View All →
          </Button>
        }
      >
        {recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-500)' }}>
            <AlertCircle size={48} color="var(--neutral-300)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ margin: 0 }}>No orders found. Create your first shipment!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--neutral-200)', color: 'var(--neutral-500)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  <th style={{ padding: '1rem' }}>Customer</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Destination</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.orderId} style={{ borderBottom: '1px solid var(--neutral-100)', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-600)' }}>
                      {order.orderId}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--neutral-800)', fontWeight: 500 }}>
                      {order.customer?.name || order.customerName || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--neutral-600)' }}>
                      {order.deliveryAddress?.city || order.deliveryCity || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--neutral-500)' }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/merchant/orders/${order.orderId}`)}>
                        Details →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
