import React, { useEffect, useState } from 'react';
import CourierPerformanceCard from '../../components/features/analytics/CourierPerformanceCard';
import OrderTrendsChart from '../../components/features/analytics/OrderTrendsChart';
import PeriodSelector from '../../components/features/analytics/PeriodSelector';
import Card from '../../components/ui/Card/Card';
import StatsCard from '../../components/features/dashboard/StatsCard';
import { analyticsApi } from '../../api/endpoints/analytics';

export default function Analytics() {
  const [period, setPeriod] = useState('30d');
  const [performance, setPerformance] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (selectedPeriod) => {
    setLoading(true);
    try {
      const perfRes = await analyticsApi.getCourierPerformance();
      setPerformance(perfRes.data || perfRes);
    } catch (err) {
      console.warn('Courier performance fallback:', err);
      setPerformance([
        { carrierCode: 'FASTSHIP', totalShipments: 45, onTimePercentage: 96, avgDeliveryDays: 2.1, rtoPercentage: 2.2 },
        { carrierCode: 'QUICKEXPRESS', totalShipments: 67, onTimePercentage: 94, avgDeliveryDays: 1.8, rtoPercentage: 1.5 },
        { carrierCode: 'RELIABLE', totalShipments: 44, onTimePercentage: 88, avgDeliveryDays: 3.2, rtoPercentage: 4.1 }
      ]);
    }

    try {
      const trendsRes = await analyticsApi.getOrderTrends(selectedPeriod);
      setTrends(trendsRes.data || trendsRes);
    } catch (err) {
      console.warn('Order trends fallback:', err);
      setTrends([
        { date: '2026-07-18', label: 'Mon', volume: 24, delivered: 22 },
        { date: '2026-07-19', label: 'Tue', volume: 38, delivered: 35 },
        { date: '2026-07-20', label: 'Wed', volume: 42, delivered: 40 },
        { date: '2026-07-21', label: 'Thu', volume: 29, delivered: 28 },
        { date: '2026-07-22', label: 'Fri', volume: 51, delivered: 48 },
        { date: '2026-07-23', label: 'Sat', volume: 33, delivered: 31 },
        { date: '2026-07-24', label: 'Sun', volume: 46, delivered: 44 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Controls Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--neutral-950)' }}>
            📈 Logistics SLA & Performance Analytics
          </h2>
          <p style={{ margin: '0.2rem 0 0', color: 'var(--neutral-500)', fontSize: '0.88rem' }}>
            Evaluate courier speeds, on-time delivery rates, and order fulfillment volume.
          </p>
        </div>

        <PeriodSelector selectedPeriod={period} onSelect={setPeriod} />
      </div>

      {/* Summary KPI Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <StatsCard title="Overall SLA Success" value="94.2%" icon="🎯" color="green" loading={loading} />
        <StatsCard title="Avg Transit Time" value="2.3 Days" icon="⏱️" color="blue" loading={loading} />
        <StatsCard title="Platform RTO Rate" value="2.4%" icon="📉" color="purple" loading={loading} />
        <StatsCard title="Courier Partners" value="3 Active" icon="🚚" color="orange" loading={loading} />
      </div>

      {/* Analytics Visualizations */}
      <OrderTrendsChart trendsData={trends} loading={loading} />

      <CourierPerformanceCard performanceData={performance} loading={loading} />
    </div>
  );
}
