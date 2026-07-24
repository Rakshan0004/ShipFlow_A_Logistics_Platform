import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastContainer from './components/ui/Toast/ToastContainer';

import AppLayout from './components/layouts/AppLayout';
import PublicLayout from './components/layouts/PublicLayout';

import Dashboard from './pages/Dashboard';
import OrderList from './pages/OrderList';
import OrderCreate from './pages/OrderCreate';
import OrderDetails from './pages/OrderDetails';
import RateComparison from './pages/RateComparison';
import TrackingCenter from './pages/TrackingCenter';
import PublicTracking from './pages/PublicTracking';
import Analytics from './pages/Analytics';
import WebhookStudio from './pages/WebhookStudio';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

import './styles/global.css';
import './styles/utilities.css';
import './styles/animations.css';
import './styles/index.css';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Internal Application Routes with Sidebar & Navbar */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<OrderList />} />
                <Route path="/orders/new" element={<OrderCreate />} />
                <Route path="/orders/:id" element={<OrderDetails />} />
                <Route path="/orders/:id/rates" element={<RateComparison />} />
                <Route path="/tracking" element={<TrackingCenter />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/webhook-studio" element={<WebhookStudio />} />
                <Route path="/settings" element={<Settings />} />
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
