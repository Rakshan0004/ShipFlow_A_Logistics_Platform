import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import RateComparisonTable from '../components/features/orders/RateComparisonTable';
import Button from '../components/ui/Button/Button';
import Card from '../components/ui/Card/Card';
import { ratesApi } from '../api/endpoints/rates';
import { useToast } from '../contexts/ToastContext';

export default function RateComparison() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [rateResponse, setRateResponse] = useState(null);
  const [loadingRates, setLoadingRates] = useState(true);
  const [sortBy, setSortBy] = useState('price');

  // Detect if we're on admin or merchant route
  const isAdminRoute = location.pathname.startsWith('/admin');
  const basePath = isAdminRoute ? '/admin' : '/merchant';

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

  const handleSelectCarrier = (option) => {
    // Navigate to the full booking confirmation page instead of a modal
    navigate(`${basePath}/orders/${id}/book`, { state: { selectedOption: option } });
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
        <Button variant="outline" size="sm" onClick={() => navigate(`${basePath}/orders/${id}`)}>
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
      />
    </div>
  );
}
