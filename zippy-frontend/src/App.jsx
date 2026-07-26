import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastContainer from './components/ui/Toast/ToastContainer';

import AppLayout from './components/layouts/AppLayout';
import PublicLayout from './components/layouts/PublicLayout';

// Merchant Pages
import MerchantDashboard from './pages/merchant/MerchantDashboard';
import MerchantOrderList from './pages/merchant/MerchantOrderList';
import MerchantTracking from './pages/merchant/MerchantTracking';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrderList from './pages/admin/AdminOrderList';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import WebhookStudio from './pages/admin/WebhookStudio';
import AdminSettings from './pages/admin/AdminSettings';

// Shared Pages
import OrderCreate from './pages/OrderCreate';
import OrderDetails from './pages/OrderDetails';
import RateComparison from './pages/RateComparison';
import TrackingCenter from './pages/TrackingCenter';
import PublicTracking from './pages/PublicTracking';
import NotFound from './pages/NotFound';

import './styles/global.css';
import './styles/utilities.css';
import './styles/animations.css';
import './styles/index.css';

// Legacy Redirect Helper Components
function LegacyOrderDetailsRedirect() {
  const { id } = useParams();
  return <Navigate to={`/merchant/orders/${id}`} replace />;
}

function LegacyOrderRatesRedirect() {
  const { id } = useParams();
  return <Navigate to={`/merchant/orders/${id}/rates`} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Root Redirect to Merchant Dashboard */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/merchant/dashboard" replace />} />
                
                {/* Merchant Routes */}
                <Route path="/merchant">
                  <Route path="dashboard" element={<MerchantDashboard />} />
                  <Route path="orders" element={<MerchantOrderList />} />
                  <Route path="orders/new" element={<OrderCreate />} />
                  <Route path="orders/:id" element={<OrderDetails />} />
                  <Route path="orders/:id/rates" element={<RateComparison />} />
                  <Route path="tracking" element={<MerchantTracking />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin">
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrderList />} />
                  <Route path="orders/:id" element={<OrderDetails />} />
                  <Route path="orders/:id/rates" element={<RateComparison />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="webhooks" element={<WebhookStudio />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* Legacy Redirects (for backwards compatibility) */}
                <Route path="/dashboard" element={<Navigate to="/merchant/dashboard" replace />} />
                <Route path="/orders" element={<Navigate to="/merchant/orders" replace />} />
                <Route path="/orders/new" element={<Navigate to="/merchant/orders/new" replace />} />
                <Route path="/orders/:id" element={<LegacyOrderDetailsRedirect />} />
                <Route path="/orders/:id/rates" element={<LegacyOrderRatesRedirect />} />
                <Route path="/tracking" element={<Navigate to="/merchant/tracking" replace />} />
                <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />
                <Route path="/webhook-studio" element={<Navigate to="/admin/webhooks" replace />} />
                <Route path="/settings" element={<Navigate to="/admin/settings" replace />} />
                
                {/* Shared Tracking Center */}
                <Route path="/tracking/center" element={<TrackingCenter />} />
              </Route>

              {/* Public Customer Tracking Routes */}
              <Route element={<PublicLayout />}>
                <Route path="/tracking/public/:trackingNumber" element={<PublicTracking />} />
                <Route path="/tracking/public" element={<PublicTracking />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>

          <ToastContainer />
        </ErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  );
}
