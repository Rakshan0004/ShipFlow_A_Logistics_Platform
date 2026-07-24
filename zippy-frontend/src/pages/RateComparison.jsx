import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import RateComparisonTable from '../components/features/orders/RateComparisonTable';
import Button from '../components/ui/Button/Button';
import Card from '../components/ui/Card/Card';
import { ratesApi } from '../api/endpoints/rates';
import { shipmentsApi } from '../api/endpoints/shipments';
import { useToast } from '../contexts/ToastContext';

export default function RateComparison() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [rateResponse, setRateResponse] = useState(null);
  const [loadingRates, setLoadingRates] = useState(true);
  const [selectingCarrier, setSelectingCarrier] = useState(false);
  const [sortBy, setSortBy] = useState('price');

  const fetchRates = async (sortCriteria = sortBy) => {
    setLoadingRates(true);
    try {
      // First try to fetch rates (this triggers rate aggregation)
      const res = await ratesApi.fetchRates(id, { sort: sortCriteria });
      setRateResponse(res.data || res);
    } catch (err) {
      console.error('Failed to fetch rates:', err);
      showToast(err.message || 'Failed to fetch courier rates', 'error');
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchRates(sortBy);
  }, [id, sortBy]);

  const handleSelectCarrier = async (option) => {
    setSelectingCarrier(true);
    try {
      const payload = {
        carrierCode: option.carrierCode,
        serviceCode: option.serviceCode,
        quotedAmount: option.totalCharge
      };

      await ratesApi.selectCarrier(id, payload);
      showToast(`Selected ${option.carrierName}! Creating shipment...`, 'success');

      // Auto-trigger shipment creation
      try {
        const shipRes = await shipmentsApi.create(id);
        showToast('Shipment booked and AWB generated!', 'success');
        navigate(`/orders/${id}`);
      } catch (shipErr) {
        showToast('Carrier selected, but shipment creation pending.', 'warning');
        navigate(`/orders/${id}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to select carrier', 'error');
    } finally {
      setSelectingCarrier(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '1.5rem',
      padding: '0',
      minHeight: '100%'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${id}`)}>
          ← Back to Order
        </Button>
        <h2 style={{ 
          fontSize: '1.2rem', 
          margin: 0,
          color: 'var(--neutral-800)',
          fontWeight: 600
        }}>
          Courier Rate Aggregation
        </h2>
      </div>

      <RateComparisonTable
        rateResponse={rateResponse}
        loading={loadingRates}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onSelectCarrier={handleSelectCarrier}
        selectingCarrier={selectingCarrier}
      />
    </div>
  );
}
