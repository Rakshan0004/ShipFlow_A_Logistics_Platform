import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OrderForm from './components/OrderForm';
import RateComparisonTable from './components/RateComparisonTable';
import CarrierSelectionCard from './components/CarrierSelectionCard';
import ShipmentCard from './components/ShipmentCard';
import TrackingTimeline from './components/TrackingTimeline';
import SimulationPanel from './components/SimulationPanel';
import './styles/index.css';

const API_BASE = 'http://localhost:8080/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('create');
  const [activeOrder, setActiveOrder] = useState(null);
  const [rateResponse, setRateResponse] = useState(null);
  const [carrierSelection, setCarrierSelection] = useState(null);
  const [shipmentData, setShipmentData] = useState(null);

  const [loadingOrder, setLoadingOrder] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [selectingCarrier, setSelectingCarrier] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [errorMsg, setErrorMsg] = useState('');

  // Re-fetch rates when sort changes
  useEffect(() => {
    if (activeOrder && activeTab === 'rates') {
      fetchRates(activeOrder.orderId, sortBy);
    }
  }, [sortBy]);

  // Handle order creation
  const handleCreateOrder = async (orderPayload) => {
    setLoadingOrder(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create order');
      }

      const orderData = await res.json();
      setActiveOrder(orderData);
      setCarrierSelection(null);
      setShipmentData(null);
      setActiveTab('rates');

      // Auto-trigger rate aggregation
      await fetchRates(orderData.orderId, sortBy);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingOrder(false);
    }
  };

  // Fetch parallel rate aggregation
  const fetchRates = async (orderId, sortCriteria) => {
    setLoadingRates(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/rates?sort=${sortCriteria}`, {
        method: 'POST'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch rates from couriers');
      }

      const ratesData = await res.json();
      setRateResponse(ratesData);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoadingRates(false);
    }
  };

  // Select carrier and freeze rate
  const handleSelectCarrier = async (option) => {
    if (!activeOrder) return;
    setSelectingCarrier(true);
    setErrorMsg('');

    try {
      const payload = {
        carrierCode: option.carrierCode,
        serviceCode: option.serviceCode,
        quotedAmount: option.totalCharge
      };

      const res = await fetch(`${API_BASE}/orders/${activeOrder.orderId}/select-carrier`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Carrier selection failed');
      }

      const selectionData = await res.json();
      setCarrierSelection(selectionData);
      setActiveTab('shipment');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSelectingCarrier(false);
    }
  };

  // Create shipment with courier
  const handleCreateShipment = async () => {
    if (!activeOrder) return;
    setCreatingShipment(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/orders/${activeOrder.orderId}/create-shipment`, {
        method: 'POST'
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Shipment creation failed');
      }

      const data = await res.json();
      setShipmentData(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCreatingShipment(false);
    }
  };

  // Refresh active order status from backend
  const refreshOrderState = async () => {
    if (!activeOrder) return;
    try {
      const res = await fetch(`${API_BASE}/orders/${activeOrder.orderId}`);
      if (res.ok) {
        const updated = await res.json();
        setActiveOrder(updated);
        if (shipmentData) {
          setShipmentData(prev => prev ? { ...prev, orderStatus: updated.orderStatus, shipment: { ...prev.shipment, currentStatus: updated.orderStatus } } : null);
        }
      }
    } catch (err) {
      console.warn('Failed to refresh order status:', err);
    }
  };

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} activeOrder={activeOrder} />

      <main className="main-content">
        {errorMsg && (
          <div className="alert-warning" style={{ background: 'rgba(244, 63, 94, 0.15)', borderColor: 'rgba(244, 63, 94, 0.4)', color: '#fda4af' }}>
            ⚠️ <strong>Error:</strong> {errorMsg}
          </div>
        )}

        {/* Tab 1: Create Order */}
        {activeTab === 'create' && (
          <OrderForm onOrderCreated={handleCreateOrder} loading={loadingOrder} />
        )}

        {/* Tab 2: Rate Comparison */}
        {activeTab === 'rates' && (
          <>
            <RateComparisonTable
              rateResponse={rateResponse}
              loading={loadingRates}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onSelectCarrier={handleSelectCarrier}
              selectingCarrier={selectingCarrier}
            />
          </>
        )}

        {/* Tab 3: Shipment & Tracking */}
        {activeTab === 'shipment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {carrierSelection && !shipmentData && (
              <CarrierSelectionCard
                selection={carrierSelection}
                onCreateShipment={handleCreateShipment}
                creatingShipment={creatingShipment}
              />
            )}

            {shipmentData && (
              <>
                <ShipmentCard shipmentData={shipmentData} />
                <TrackingTimeline currentStatus={shipmentData.shipment?.currentStatus || 'SHIPMENT_CREATED'} />
              </>
            )}

            {!carrierSelection && !shipmentData && (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Please select a courier from the Rate Comparison tab first.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Simulation Controls */}
        {activeTab === 'simulation' && (
          <SimulationPanel activeShipment={shipmentData} onRefreshOrder={refreshOrderState} />
        )}
      </main>
    </div>
  );
}
