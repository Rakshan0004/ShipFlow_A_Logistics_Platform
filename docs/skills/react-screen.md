# Skill: React Screen Conventions

Re-read this before creating any new screen, component, or API call.

---

## Project Setup

- **Bundler:** Vite
- **Router:** React Router v6 (`react-router-dom`)
- **HTTP client:** Axios (or native `fetch` with a wrapper)
- **State:** React hooks (`useState`, `useEffect`, `useCallback`) — no Redux needed for this scope
- **Styling:** CSS modules or plain CSS — one stylesheet per component when needed

---

## Directory Structure

```
zippy-frontend/src/
├── App.jsx                           // Router setup, layout wrapper
├── main.jsx                          // Entry point
├── api/
│   └── client.js                     // Axios instance + API functions
├── pages/
│   ├── CreateOrder.jsx               // Full-page screens
│   ├── CourierSelection.jsx
│   └── OrderTracking.jsx
├── components/
│   ├── OrderForm.jsx                 // Reusable form component
│   ├── RateTable.jsx                 // Sortable rate comparison table
│   ├── StatusTimeline.jsx            // Vertical timeline of status events
│   └── common/
│       ├── LoadingSpinner.jsx
│       ├── ErrorBanner.jsx
│       └── EmptyState.jsx
├── hooks/
│   └── usePolling.js                 // Custom hook for periodic data fetching
└── styles/
    ├── global.css                    // Base styles, CSS variables
    └── *.css                         // Per-component styles if needed
```

---

## API Client Pattern

```javascript
// api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// --- Order APIs ---
export const createOrder = (orderData) => api.post('/api/orders', orderData);
export const getOrder = (orderId) => api.get(`/api/orders/${orderId}`);

// --- Rate APIs ---
export const fetchRates = (orderId) => api.post(`/api/orders/${orderId}/rates`);
export const getCachedRates = (orderId) => api.get(`/api/orders/${orderId}/rates`);

// --- Carrier Selection ---
export const selectCarrier = (orderId, selection) =>
  api.post(`/api/orders/${orderId}/select-carrier`, selection);

// --- Shipment ---
export const createShipment = (orderId) =>
  api.post(`/api/orders/${orderId}/create-shipment`);

// --- Tracking ---
export const getTracking = (orderId) => api.get(`/api/orders/${orderId}/tracking`);
```

**Rules:**
- One API function per endpoint — no raw `axios.get()` calls in components
- Base URL from environment variable (`VITE_API_BASE_URL`)
- Always set a timeout
- Let errors propagate — catch them in the component's `try/catch`

---

## Page Component Pattern

```jsx
// pages/CreateOrder.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../api/client';
import OrderForm from '../components/OrderForm';
import ErrorBanner from '../components/common/ErrorBanner';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await createOrder(formData);
      navigate(`/orders/${data.orderId}/rates`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>Create Order</h1>
      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
      {loading ? <LoadingSpinner /> : <OrderForm onSubmit={handleSubmit} />}
    </div>
  );
}
```

**Pattern:**
1. Each page manages its own `loading`, `error`, and `data` state
2. API calls in event handlers (not in `useEffect` for mutations)
3. Navigation via `useNavigate()` after successful operations
4. Error messages extracted from API response (`err.response.data.message`)

---

## Data Fetching Pattern (GET endpoints)

```jsx
// pages/OrderTracking.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder, getTracking } from '../api/client';

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [orderRes, trackingRes] = await Promise.all([
        getOrder(orderId),
        getTracking(orderId),
      ]);
      setOrder(orderRes.data);
      setTracking(trackingRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Polling every 5 seconds for tracking updates
  useEffect(() => {
    if (!tracking?.shipment) return;
    const terminal = ['DELIVERED', 'RTO'];
    if (terminal.includes(tracking.shipment.currentStatus)) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await getTracking(orderId);
        setTracking(data);
      } catch { /* silently ignore polling errors */ }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, tracking?.shipment?.currentStatus]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;
  // ... render order details and tracking timeline
}
```

**Rules:**
- Use `useEffect` for initial data loading
- Use `useCallback` for fetch functions to avoid stale closures
- Polling stops when status is terminal (`DELIVERED`, `RTO`)
- Polling errors are silently ignored (don't flash error banners on transient failures)

---

## Form Handling Pattern

```jsx
// components/OrderForm.jsx
import { useState } from 'react';

const INITIAL_STATE = {
  merchantOrderId: '',
  customer: { name: '', phone: '', email: '' },
  pickupAddress: { addressLine1: '', city: '', state: '', pincode: '' },
  deliveryAddress: { addressLine1: '', city: '', state: '', pincode: '' },
  package: { weightGrams: '', lengthCm: '', widthCm: '', heightCm: '' },
  paymentType: 'PREPAID',
  codAmount: '',
};

export default function OrderForm({ onSubmit }) {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});

  const handleChange = (section, field, value) => {
    if (section) {
      setForm(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.merchantOrderId) errs.merchantOrderId = 'Required';
    if (!form.customer.name) errs.customerName = 'Required';
    if (!form.pickupAddress.pincode) errs.pickupPincode = 'Required';
    if (!form.deliveryAddress.pincode) errs.deliveryPincode = 'Required';
    if (form.paymentType === 'COD' && !form.codAmount) errs.codAmount = 'Required for COD';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return <form onSubmit={handleSubmit}>{ /* ... fields ... */ }</form>;
}
```

**Rules:**
- Forms use controlled components (`useState`)
- Client-side validation before submit (server validates too)
- Nested state for nested objects (customer, address, package)
- `onSubmit` callback passed from parent page — form doesn't call API directly

---

## Component Conventions

| Convention | Rule |
|-----------|------|
| File naming | PascalCase for components: `OrderForm.jsx`, `RateTable.jsx` |
| Export | Default export per component file |
| Props | Destructure in function signature: `function RateTable({ rates, onSelect })` |
| State | `useState` for component-local state |
| Side effects | `useEffect` with dependency arrays — never missing deps |
| Conditional rendering | `{loading ? <Spinner /> : <Content />}` |
| Lists | Always use `key` prop — prefer stable IDs, not array indices |
| Error boundaries | `ErrorBanner` for API errors, not React error boundaries (overkill for this scope) |

---

## Navigation Flow

```
/ (redirect to /orders/new)
├── /orders/new                    → CreateOrder page
├── /orders/:orderId/rates         → CourierSelection page
└── /orders/:orderId               → OrderTracking page
```

After each step:
1. Create Order → success → navigate to `/orders/{orderId}/rates`
2. Fetch Rates → display table → select carrier → confirm → create shipment → navigate to `/orders/{orderId}`
3. Order Tracking → shows details + polling status updates

---

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8080
```

In Docker: set to `http://zippy-backend:8080` or use nginx reverse proxy.
