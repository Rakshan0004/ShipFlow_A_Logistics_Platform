# Orders & Payments Module — Implementation Plan

> **Scope**: Add two new things only — a detailed Order View page and a Payments module.  
> **No existing UI pages are redesigned.** Only additive changes.

---

## 1. What We Are Adding

### 1.1 Merchant Order Detail View (Enhanced)
The existing `/merchant/orders/:id` route uses a shared `OrderDetails.jsx` that serves both admin and merchant. We will create a dedicated **`MerchantOrderDetail.jsx`** page under `/merchant/orders/:id` that shows:

- Full order summary (status, dates, IDs)
- Customer information (name, phone, email)
- Pickup & Delivery addresses
- **Package details** (weight in kg, L × W × H in cm, volumetric weight)
- Courier info (carrier name, AWB number, service type)
- Tracking timeline (existing events)
- **Payment Info card** (new — pulled from the payments table)

The admin still uses `OrderDetails.jsx` unchanged. We only add a separate merchant view.

---

### 1.2 Payments Module
A new **`/merchant/payments`** page with:
- Summary cards: Total Revenue, Paid, Pending, Settled
- Full payments table: all payment fields per order
- Filter by Payment Status, Settlement Status
- Search by Transaction ID or Order ID
- Each row links to the order detail page

---

## 2. Payment Entity Design

### Why a separate table?
The existing `orders` table only has `cod_amount`. There is no structure for tax, shipping charges, invoicing, settlement tracking, or transaction IDs. Adding these as columns on `orders` would violate single responsibility and bloat the order entity. A separate `payments` table is the right call — one payment per order (1:1).

### Schema — `payments` table

```sql
-- V6__create_payment_table.sql
CREATE TABLE payments (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id          BIGINT         NOT NULL UNIQUE REFERENCES orders(id),
    transaction_id    VARCHAR(50)    NOT NULL UNIQUE,
    invoice_number    VARCHAR(30)    NOT NULL UNIQUE,
    order_amount      DECIMAL(12,2)  NOT NULL,
    shipping_charges  DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    tax               DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
    total_amount      DECIMAL(12,2)  NOT NULL,
    payment_method    VARCHAR(20)    NOT NULL,   -- 'COD' | 'PREPAID'
    payment_status    VARCHAR(20)    NOT NULL,   -- 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED'
    settlement_status VARCHAR(20)    NOT NULL,   -- 'PENDING' | 'PROCESSING' | 'SETTLED'
    settlement_date   DATE,                      -- NULL until settled
    created_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);
CREATE INDEX idx_payments_settlement_status ON payments(settlement_status);
```

### Field derivation logic (mock generation)

When a payment record does not exist for an order, the `PaymentService` generates and persists one automatically. This happens on first access only — it is saved to DB, not regenerated every time.

#### `payment_method`
Directly mirrors `orders.payment_type`:
```
order.paymentType == "COD"     → payment_method = "COD"
order.paymentType == "PREPAID" → payment_method = "PREPAID"
```

#### `order_amount`
```
COD order    → order.codAmount (already stored)
PREPAID      → fixed mock: seeded from order ID to be consistent (e.g., 499, 999, 1499...)
```

#### `shipping_charges`
```
Shipment exists → shipment.quotedAmount
No shipment     → deterministic mock: 49 / 79 / 99 / 129 (seeded from order ID)
```

#### `tax`
```
18% GST on shipping_charges only
tax = shipping_charges × 0.18
```

#### `total_amount`
```
total_amount = order_amount + shipping_charges + tax
```

#### `payment_status` — derived from `order.orderStatus`

| Order Status | Payment Status |
|---|---|
| `DELIVERED` | `PAID` |
| `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `PICKED_UP` | `PAID` |
| `SHIPMENT_CREATED`, `CARRIER_SELECTED`, `ORDER_CREATED` | `PENDING` |
| `CANCELLED` | `REFUNDED` |
| `DELIVERY_FAILED`, `RTO` | `FAILED` |

#### `settlement_status` — derived from payment_status

| Payment Status | Settlement Status |
|---|---|
| `PAID` + order is DELIVERED (>2 days ago) | `SETTLED` |
| `PAID` + order in transit | `PROCESSING` |
| `PENDING` or `REFUNDED` | `PENDING` |
| `FAILED` | `PENDING` |

#### `settlement_date`
```
SETTLED  → order.updatedAt + 3 days (deterministic)
Others   → null
```

#### `transaction_id`
```
"TXN" + SHA-like hash from orderId (first 12 chars uppercase)
Example: "TXNZPY10001A7F"
```

#### `invoice_number`
```
"INV-" + year + "-" + zero-padded order DB ID
Example: "INV-2025-000012"
```

---

## 3. Backend Changes

### 3.1 New Flyway Migration
- **`V6__create_payment_table.sql`** — payment table + indexes (schema above)

### 3.2 New `Payment.java` (model)
JPA entity mapping to `payments` table.  
Has a `@OneToOne` relationship to `Order` (join on `order_id`).

### 3.3 New `PaymentRepository.java`
```java
interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrder_ZippyOrderId(String zippyOrderId);
    Optional<Payment> findByOrder_Id(Long orderId);
    Page<Payment> findAll(Pageable pageable);
    Page<Payment> findByPaymentStatus(String status, Pageable pageable);
    Page<Payment> findBySettlementStatus(String status, Pageable pageable);
}
```

### 3.4 New `PaymentService.java`
Two public methods:

```java
// Returns payment for one order. Auto-generates + saves if not present.
PaymentResponse getOrCreatePayment(String zippyOrderId);

// Paginated list of all payments, optional status filter
Page<PaymentResponse> getAllPayments(int page, int size, String paymentStatus, String settlementStatus);
```

The private `generatePayment(Order order, Shipment shipment)` method implements all derivation rules above.

### 3.5 New `PaymentResponse.java` (DTO)
```java
// All payment fields plus enriched order info:
String orderId, merchantOrderId, customerName;
String transactionId, invoiceNumber;
BigDecimal orderAmount, shippingCharges, tax, totalAmount;
String paymentMethod, paymentStatus, settlementStatus;
LocalDate settlementDate;
Instant createdAt, updatedAt;
```

### 3.6 New `PaymentController.java`
```
GET /api/payments/{orderId}
    → PaymentService.getOrCreatePayment(orderId)
    → Returns: PaymentResponse

GET /api/payments?page=0&size=20&paymentStatus=PAID&settlementStatus=SETTLED
    → PaymentService.getAllPayments(...)
    → Returns: Page<PaymentResponse>
```

### 3.7 No changes to existing controllers or services
`OrderController`, `OrderService`, `DashboardController`, `DashboardService` are **not touched**.

---

## 4. Frontend Changes

### 4.1 New `payments.js` (api/endpoints)
```js
export const paymentsApi = {
  getByOrderId: (orderId) => apiClient.get(`/api/payments/${orderId}`),
  getAll: (params) => apiClient.get('/api/payments', { params }),
};
```

### 4.2 New `MerchantOrderDetail.jsx` (pages/merchant)
Route: `/merchant/orders/:id`  
**Replaces** the shared `OrderDetails.jsx` for the merchant route only.

Sections:
1. **Header** — Order ID, status badge, back button, created date
2. **Order Summary Card** — Order ID, Merchant Ref, Status, Payment Method, Created At, Updated At
3. **Customer Info Card** — Name, Phone, Email
4. **Address Card** — Pickup address / Delivery address side by side
5. **Package Details Card** (NEW) — Weight (g and kg), Length × Width × Height, Volumetric Weight calculation
6. **Courier & Shipment Card** — Carrier name, AWB number, Service type, Quoted amount
7. **Payment Info Card** (NEW) — all payment fields from `PaymentResponse`
8. **Tracking Timeline** — Existing `StatusTimeline` component reused

> Admin route (`/admin/orders/:id`) continues to use the existing `OrderDetails.jsx` — no change.

### 4.3 New `MerchantPayments.jsx` (pages/merchant)
Route: `/merchant/payments`

Layout:
```
[Summary Cards Row]
  Total Revenue | Paid Orders | Pending Payments | Settled Payments

[Filters Row]
  Payment Status: [All] [Paid] [Pending] [Failed] [Refunded]
  Settlement:     [All] [Settled] [Processing] [Pending]
  Search: [input — transaction ID or order ID]

[Payments Table]
  Transaction ID | Invoice # | Order ID | Customer | Amount | Method | Pay Status | Settlement | Date | Action
```

Each row → "View Order" links to `/merchant/orders/:orderId`.

### 4.4 Sidebar update — `Sidebar.jsx`
Add one item to `merchantItems`:
```js
{ path: '/merchant/payments', label: 'Payments', icon: '💳' }
```

### 4.5 `App.jsx` — add two routes
```jsx
// Replace merchant order detail route:
<Route path="orders/:id" element={<MerchantOrderDetail />} />

// Add payments route:
<Route path="payments" element={<MerchantPayments />} />
```

---

## 5. UI Changes — Where & What

This section maps every UI change to a specific file and describes exactly what gets added or changed visually.

---

### 5.1 Existing Pages — Minor Additive Changes Only

#### `Sidebar.jsx` — Add 1 nav item
```
MERCHANT PORTAL
  📊 My Dashboard
  ➕ Create Order
  📦 My Orders
  💳 Payments          ← ADD THIS (links to /merchant/payments)
  🔍 Track Shipment
```
Nothing else changes in the sidebar.

---

#### `MerchantDashboard.jsx` — Add 1 quick action card
The existing "Quick Actions" grid already has 3 buttons (Create Order, View All Orders, Track Shipment).  
Add a 4th:
```
💳  Payments
View payment history & settlements
```
No stats cards are changed. No layout is redesigned. Just one more card in the existing grid.

---

#### `MerchantOrderList.jsx` — Add 1 column to the existing table
The current table has: Order ID | Merchant Ref | Customer | Status | Courier | Destination | Created | Actions

Add one column between Status and Courier:
```
| Payment |
  COD  ← orange badge
  PREPAID ← blue badge
```
This is just a badge rendered from `order.paymentType`. No other changes to the list page.

---

### 5.2 New Page — `MerchantOrderDetail.jsx`

Route: `/merchant/orders/:id` (merchant only — admin keeps using `OrderDetails.jsx`)

**Full page layout:**

```
← Back to Orders    [Order ID: ZPY-ORD-10001]    [Status Badge]

┌─────────────────────────────────────────────────────────┐
│ ORDER SUMMARY CARD                                       │
│  Zippy ID | Merchant Ref | Status | Pay Method | Dates  │
└─────────────────────────────────────────────────────────┘

┌──────────────────────┐  ┌──────────────────────────────┐
│ CUSTOMER INFO        │  │ ADDRESSES                    │
│  Name                │  │  Pickup:  full address        │
│  Phone               │  │  Delivery: full address       │
│  Email               │  │                              │
└──────────────────────┘  └──────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PACKAGE DETAILS  (NEW — doesn't exist anywhere yet)     │
│  Weight: 500 g (0.5 kg)                                 │
│  Dimensions: 20 cm × 15 cm × 10 cm                      │
│  Volumetric Weight: 0.375 kg  (L×W×H / 5000)           │
│  Chargeable Weight: 0.5 kg  (higher of actual / vol.)   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ COURIER & SHIPMENT                                       │
│  Carrier | AWB Number | Service | Quoted Amount          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PAYMENT DETAILS  (NEW — fetched from /api/payments/:id) │
│                                                         │
│  Transaction ID   INV-2025-000012                       │
│  Invoice Number   TXN7F3K2X9A1BQ                        │
│                                                         │
│  Order Amount     ₹999.00                               │
│  Shipping Charges  ₹79.00                               │
│  Tax (18% GST)    ₹14.22                               │
│  ─────────────────────────────                          │
│  Total Amount     ₹1,092.22                             │
│                                                         │
│  Payment Method   COD  [badge]                          │
│  Payment Status   PAID  [green badge]                   │
│  Settlement       SETTLED  [badge]                      │
│  Settlement Date  12 Jan 2025                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TRACKING TIMELINE  (reuses existing StatusTimeline)     │
└─────────────────────────────────────────────────────────┘
```

Reused components: `OrderSummaryCard`, `CustomerInfoCard`, `AddressCard`, `StatusTimeline` — all from `components/features/orders/`.  
New components needed: `PackageDetailsCard`, `PaymentInfoCard` — created inside `MerchantOrderDetail.jsx` as inline components (no separate files needed for now).

---

### 5.3 New Page — `MerchantPayments.jsx`

Route: `/merchant/payments`

**Full page layout:**

```
Payments & Settlements
Manage and track all your payment records

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total Revenue│ │ Paid         │ │ Pending      │ │ Settled      │
│  ₹42,300     │ │  28 orders   │ │  12 orders   │ │  19 orders   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

[Filter: Pay Status]  [Filter: Settlement]  [Search: TxnID / OrderID]

┌────────────────────────────────────────────────────────────────────────┐
│ Transaction ID | Invoice # | Order ID | Customer | Amount | Method |   │
│ Pay Status | Settlement | Settlement Date | Actions                    │
├────────────────────────────────────────────────────────────────────────┤
│ TXN7F3K2...   INV-2025-000012  ZPY-ORD-10001  Ravi Kumar  ₹1,092  COD │
│ PAID [green]   SETTLED [blue]   12 Jan 2025   [View Order]            │
│ ...                                                                    │
└────────────────────────────────────────────────────────────────────────┘

[← Previous]  Page 1 of 3  [Next →]
```

Summary cards are computed client-side from the paginated data (total fields returned in the API response).  
"View Order" navigates to `/merchant/orders/:orderId`.

---

## 6. File Change Summary

### New Files
| File | Type | Purpose |
|---|---|---|
| `V6__create_payment_table.sql` | SQL | Flyway migration |
| `Payment.java` | Java | JPA Entity |
| `PaymentRepository.java` | Java | Spring Data repository |
| `PaymentService.java` | Java | Business logic + mock generation |
| `PaymentResponse.java` | Java | Response DTO |
| `PaymentController.java` | Java | REST endpoints |
| `MerchantOrderDetail.jsx` | React | Detailed merchant order page |
| `MerchantPayments.jsx` | React | Payments list page |
| `payments.js` | JS | Frontend API client |

### Modified Files (minimal changes)
| File | Change |
|---|---|
| `App.jsx` | Add `MerchantOrderDetail` route + `MerchantPayments` route |
| `Sidebar.jsx` | Add "Payments" nav item to merchant section |

### Untouched Files
- `MerchantDashboard.jsx` — no changes
- `MerchantOrderList.jsx` — no changes  
- `OrderDetails.jsx` — no changes (admin still uses it)
- All existing backend files — no changes

---

## 6. Verification Plan

### Build check
```bash
# Backend
./gradlew :zippy-backend:build

# Frontend  
cd zippy-frontend && npm run build
```

### Manual testing flow
1. Start backend + DB → Flyway runs V6 cleanly
2. Hit `GET /api/payments/ZPY-ORD-10001` → payment auto-generated and returned
3. Hit again → same data returned (not regenerated)
4. Open `/merchant/orders/ZPY-ORD-10001` → see new detail page with Payment card
5. Open `/merchant/payments` → see payments table + filters working
6. Open `/admin/orders/ZPY-ORD-10001` → old `OrderDetails.jsx` still works unchanged
