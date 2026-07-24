import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActiveShipmentsTable from '../components/features/tracking/ActiveShipmentsTable';
import Card from '../components/ui/Card/Card';
import Button from '../components/ui/Button/Button';
import Select from '../components/ui/Select/Select';
import SearchInput from '../components/ui/Input/SearchInput';
import { shipmentsApi } from '../api/endpoints/shipments';
import { ordersApi } from '../api/endpoints/orders';

export default function TrackingCenter() {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchActiveShipments = async () => {
    setLoading(true);
    try {
      const res = await shipmentsApi.getActive();
      const list = res.data || res;
      if (Array.isArray(list) && list.length > 0) {
        setShipments(list);
      } else {
        // Fallback: Fetch all orders and filter active non-terminal shipments
        const ordersRes = await ordersApi.getAll();
        const allOrders = ordersRes.data || ordersRes;
        if (Array.isArray(allOrders)) {
          const active = allOrders.filter(o => !['DELIVERED', 'CANCELLED', 'RTO'].includes(o.orderStatus));
          setShipments(active);
        }
      }
    } catch (err) {
      console.warn('Active shipments fallback:', err);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchActiveShipments();

    // 30 second auto refresh
    const timer = setInterval(fetchActiveShipments, 30000);
    return () => clearInterval(timer);
  }, []);

  const filteredShipments = shipments.filter(item => {
    const q = search.toLowerCase();
    const matchesSearch = !q || 
      item.orderId?.toLowerCase().includes(q) ||
      item.trackingNumber?.toLowerCase().includes(q) ||
      item.carrierCode?.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || item.orderStatus === statusFilter || item.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--neutral-950)' }}>
              📍 Active In-Transit Tracking Center
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--neutral-500)', marginTop: '0.2rem' }}>
              Auto-refreshing every 30 seconds • Last updated: {lastRefreshed.toLocaleTimeString()}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="outline" size="sm" onClick={fetchActiveShipments}>
              🔄 Refresh Now
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/webhook-studio')}>
              ⚡ Webhook Simulator
            </Button>
          </div>
        </div>
      </Card>

      {/* Filter Bar */}
      <Card>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <SearchInput 
              value={search} 
              onChange={setSearch} 
              placeholder="Search by AWB tracking #, Order ID..." 
            />
          </div>
          <div style={{ width: '200px' }}>
            <Select 
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'ALL', label: 'All In-Transit Statuses' },
                { value: 'SHIPMENT_CREATED', label: 'Shipment Created' },
                { value: 'PICKED_UP', label: 'Picked Up' },
                { value: 'IN_TRANSIT', label: 'In Transit' },
                { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' }
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Active Shipments List */}
      <Card title={`Active Shipments (${filteredShipments.length})`}>
        <ActiveShipmentsTable shipments={filteredShipments} loading={loading} />
      </Card>
    </div>
  );
}
