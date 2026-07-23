# Requirements — Zippy Mock Logistics Platform

## Overview

Zippy is a **logistics aggregation platform** that connects merchants with multiple courier
companies. This assignment builds a simplified version demonstrating the core flow:
order creation → rate comparison → carrier selection → shipment creation → status tracking.

The system consists of:
- A **React frontend** for merchant interaction (3 screens)
- A **Spring Boot backend** (Zippy API) that orchestrates all business logic
- **Three mock courier services** (FastShip, QuickExpress, ReliableCourier), each with unique API formats
- A **relational database** persisting orders, quotes, shipments, and status events

---

## Functional Flow

### Step 1: Create an Order

The merchant fills a form in the frontend with:

| Field | Notes |
|-------|-------|
| Merchant order number | External reference (e.g. `MERCHANT-10001`) |
| Customer name | |
| Customer phone number | |
| Customer email | |
| Pickup address | addressLine1, city, state, pincode |
| Delivery address | addressLine1, city, state, pincode |
| Package weight | In grams (e.g. `1500`) |
| Package dimensions | lengthCm, widthCm, heightCm |
| Payment type | `PREPAID` or `COD` |
| COD amount | Required when payment type is COD |

**Backend behavior:**
- Validates and persists the order
- Generates a Zippy order ID (format: `ZPY-ORD-{sequence}`, e.g. `ZPY-ORD-10001`)
- Sets initial status to `ORDER_CREATED`

### Step 2: Get Rates from Three Mock Courier Services

After order creation, the backend requests rates from all three couriers **in parallel**.
Each courier exposes a different API format (different URLs, field names, structures).

The backend must:
- Call all 3 couriers concurrently
- Handle partial failures (if one is down, return the others)
- Apply per-call timeouts (one slow courier must not block the others)
- **Never expose courier-specific formats to the frontend** — always normalize first

### Step 3: Normalize Courier Responses

All courier rate responses are converted to a common **Zippy Rate Response** format:

```json
{
  "orderId": "ZPY-ORD-10001",
  "shippingOptions": [
    {
      "carrierCode": "FASTSHIP",
      "carrierName": "FastShip",
      "serviceCode": "FAST-AIR",
      "serviceName": "FastShip Air Express",
      "baseCharge": 120.00,
      "codCharge": 35.00,
      "additionalCharges": 0.00,
      "tax": 27.90,
      "totalCharge": 182.90,
      "estimatedMinDays": 2,
      "estimatedMaxDays": 2
    }
  ]
}
```

The frontend displays these in a sortable table (columns: Carrier, Service, Base Charge, COD
Charge, Other Charges, Tax, Total, Estimated Delivery, Select).

Sorting options: lowest price, fastest delivery, carrier name.

### Step 4: Select a Courier

The merchant picks one shipping option. The backend saves:
- Selected carrier and service
- Quoted shipping charge (frozen — must not change if rates change later)
- Selection timestamp
- Original carrier quote

Order status transitions to: `CARRIER_SELECTED`

### Step 5: Create Shipment with Selected Courier

The backend calls the selected courier's shipment-creation API (each has a different format).
On success:
- Stores carrier shipment ID and tracking number
- Order status transitions to: `SHIPMENT_CREATED`

### Step 6: Courier Status Events (Webhooks)

Mock couriers send status updates to Zippy webhook endpoints. The suggested status flow is:

```
SHIPMENT_CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
```

Each courier uses a different webhook format and different status representations.

### Step 7: Normalize Shipment Statuses

All courier-specific statuses are mapped to a common Zippy status enum. The backend maintains
both the **current status** and a **complete status history**.

### Step 8: Frontend Screens

Three screens minimum:
1. **Create Order** — form with all order fields
2. **Courier Selection** — normalized rate table with sorting/comparison
3. **Order Details & Tracking** — order info, selected carrier, tracking number, current status, status history

Status updates can use: polling, SSE, WebSocket, or manual refresh.
WebSocket/SSE are bonus features.

---

## Three Courier Request/Response Formats (Fixed Contracts)

### Courier 1: FastShip

**Rate API:** `POST /fastship/api/v1/rate`

Request:
```json
{
  "origin_pin": "560001",
  "destination_pin": "110001",
  "weight_kg": 1.5,
  "payment_mode": "COD",
  "invoice_value": 2500
}
```

Response:
```json
{
  "success": true,
  "service": {
    "service_code": "FAST-AIR",
    "service_name": "FastShip Air Express",
    "freight_charge": 120.00,
    "cod_charge": 35.00,
    "tax": 27.90,
    "total_amount": 182.90,
    "estimated_days": 2
  }
}
```

**Shipment Creation:** `POST /fastship/api/v1/shipments`

Request:
```json
{
  "reference_number": "ZPY-ORD-10001",
  "service_code": "FAST-AIR",
  "shipper": { "name": "Zippy Merchant", "postal_code": "560001" },
  "consignee": { "name": "Rahul Sharma", "phone": "9876543210", "postal_code": "110001" },
  "parcel": { "weight_kg": 1.5 },
  "cod": { "enabled": true, "amount": 2500 },
  "callback_url": "http://zippy-backend/api/webhooks/fastship"
}
```

Response:
```json
{
  "success": true,
  "shipment_id": "FS-700001",
  "tracking_number": "FST123456789",
  "label_url": "http://mock-fastship/labels/FST123456789.pdf",
  "status": "BOOKED"
}
```

**Webhook:** `POST /api/webhooks/fastship`
```json
{
  "shipment_id": "FS-700001",
  "tracking_number": "FST123456789",
  "event_code": "IN_TRANSIT",
  "event_description": "Shipment departed Bengaluru hub",
  "event_time": "2026-07-15T10:30:00Z",
  "location": "Bengaluru Hub"
}
```

---

### Courier 2: QuickExpress

**Rate API:** `POST /quickexpress/rates/check`

Request:
```json
{
  "pickupPincode": "560001",
  "deliveryPincode": "110001",
  "weightInGrams": 1500,
  "dimensions": { "length": 20, "breadth": 15, "height": 10 },
  "isCod": true,
  "collectableAmount": 2500
}
```

Response:
```json
{
  "status": "AVAILABLE",
  "quoteId": "QE-Q-90001",
  "charges": {
    "shipping": 115.00,
    "cod": 40.00,
    "fuelSurcharge": 12.00,
    "gst": 30.06
  },
  "payable": 197.06,
  "deliveryEstimate": { "minimumDays": 2, "maximumDays": 3 },
  "product": "EXPRESS"
}
```

**Shipment Creation:** `POST /quickexpress/booking/create`

Request:
```json
{
  "clientOrderId": "ZPY-ORD-10001",
  "quoteId": "QE-Q-90001",
  "productType": "EXPRESS",
  "receiverDetails": { "fullName": "Rahul Sharma", "mobileNumber": "9876543210", "postalCode": "110001" },
  "packageDetails": { "deadWeight": 1500, "weightUnit": "GRAM" },
  "payment": { "mode": "CASH_ON_DELIVERY", "amountToCollect": 2500 },
  "webhook": "http://zippy-backend/api/webhooks/quickexpress"
}
```

Response:
```json
{
  "bookingStatus": "CONFIRMED",
  "booking": {
    "bookingId": "QE-B-800001",
    "awb": "QE987654321",
    "currentState": "SHIPMENT_CREATED"
  }
}
```

**Webhook:** `POST /api/webhooks/quickexpress`
```json
{
  "awb": "QE987654321",
  "event": {
    "type": "OFD",
    "message": "Shipment is out for delivery",
    "occurredAt": "2026-07-17T08:15:00Z"
  },
  "facility": { "city": "New Delhi", "code": "DEL-01" }
}
```

QuickExpress event codes: `SC` (Created), `PU` (Picked Up), `IT` (In Transit), `OFD` (Out for Delivery), `DLV` (Delivered)

---

### Courier 3: ReliableCourier

**Rate API:** `GET /reliablecourier/shipping-options?from=560001&to=110001&weight=1500&cod=true&amount=2500`

Response:
```json
{
  "code": 200,
  "data": [
    {
      "id": "RC-SURFACE",
      "name": "Reliable Surface",
      "rate": {
        "base": 95.00,
        "handling": 10.00,
        "cashCollectionFee": 30.00,
        "taxAmount": 24.30,
        "grandTotal": 159.30
      },
      "eta": "4-5 business days"
    },
    {
      "id": "RC-AIR",
      "name": "Reliable Air",
      "rate": {
        "base": 130.00,
        "handling": 12.00,
        "cashCollectionFee": 30.00,
        "taxAmount": 30.96,
        "grandTotal": 202.96
      },
      "eta": "2-3 business days"
    }
  ]
}
```

Note: ReliableCourier returns **multiple** service options in one response, unlike FastShip (one) and QuickExpress (one).

**Shipment Creation:** `PUT /reliablecourier/orders`

Request:
```json
{
  "orderReference": "ZPY-ORD-10001",
  "selectedOption": "RC-SURFACE",
  "destination": { "contact": "Rahul Sharma", "phone": "9876543210", "zip": "110001" },
  "parcelWeight": { "value": 1.5, "unit": "KG" },
  "collectionType": "COD",
  "collectionAmount": 2500,
  "statusNotificationUrl": "http://zippy-backend/api/webhooks/reliable"
}
```

Response:
```json
{
  "result": "ACCEPTED",
  "deliveryOrder": { "id": "RC-DO-600001", "trackingCode": "RC1122334455" },
  "message": "Shipment successfully registered"
}
```

**Webhook:** `POST /api/webhooks/reliable`
```json
{
  "trackingCode": "RC1122334455",
  "statusId": 50,
  "statusText": "Delivered",
  "updatedOn": "2026-07-19T15:45:00Z",
  "proofOfDelivery": { "receivedBy": "Rahul Sharma", "deliveryLocation": "New Delhi" }
}
```

ReliableCourier status IDs: `10` (Created), `20` (Picked Up), `30` (In Transit), `40` (Out for Delivery), `50` (Delivered), `60` (Delivery Failed), `70` (Returned to Origin)

---

## Normalized Zippy Formats

### Zippy Rate Response Format

See Step 3 above. Key fields per option: `carrierCode`, `carrierName`, `serviceCode`,
`serviceName`, `baseCharge`, `codCharge`, `additionalCharges`, `tax`, `totalCharge`,
`estimatedMinDays`, `estimatedMaxDays`.

### Zippy Status Enum

| Zippy Status | FastShip | QuickExpress | ReliableCourier |
|---|---|---|---|
| `SHIPMENT_CREATED` | `BOOKED` | `SC` | `10` |
| `PICKED_UP` | `PICKED_UP` | `PU` | `20` |
| `IN_TRANSIT` | `IN_TRANSIT` | `IT` | `30` |
| `OUT_FOR_DELIVERY` | `OUT_FOR_DELIVERY` | `OFD` | `40` |
| `DELIVERED` | `DELIVERED` | `DLV` | `50` |
| `DELIVERY_FAILED` | `DELIVERY_FAILED` | `NDR` | `60` |
| `RTO` | `RETURNED` | `RTO` | `70` |

### Minimum Data Model

**Order:** id, zippy_order_id, merchant_order_id, customer_name, customer_phone, customer_email,
pickup_pincode, delivery_pincode, weight_grams, length_cm, width_cm, height_cm, payment_type,
cod_amount, order_status, created_at, updated_at

**Shipping Quote:** id, order_id, carrier_code, service_code, service_name, base_charge,
cod_charge, additional_charges, tax, total_charge, estimated_min_days, estimated_max_days,
raw_carrier_response, created_at

**Shipment:** id, order_id, carrier_code, carrier_shipment_id, tracking_number,
selected_service_code, quoted_amount, current_status, created_at, updated_at

**Shipment Event:** id, shipment_id, carrier_event_id, carrier_status, normalized_status,
description, location, event_time, raw_event_payload, received_at

---

## Failure Scenarios (Explicit from Spec)

1. **One carrier is down** — If QuickExpress returns HTTP 500, rates from FastShip and
   ReliableCourier should still be returned.

2. **Carrier timeout** — The backend must not wait indefinitely. A reasonable timeout must be
   configured per call.

3. **Duplicate webhook** — If a courier sends the same event more than once, no duplicate
   history entries should be created.

4. **Unknown tracking number** — A webhook for an unknown shipment should be rejected or safely
   recorded for investigation.

5. **Invalid status transition** — A shipment must not move from `DELIVERED` back to `IN_TRANSIT`.
   Either reject the update or explain the handling approach.

6. **Price change after quote** — The selected carrier quote must be saved with the shipment so
   later rate changes do not alter the originally quoted amount.

---

## Testing Expectations (from Spec)

At minimum, tests must cover:

| Test Area | Notes |
|-----------|-------|
| Order creation | Validation, persistence, ID generation |
| Courier-response normalization | All 3 formats → Zippy format |
| Rate sorting | By price, delivery time, carrier name |
| One courier failing | Partial failure returns remaining rates |
| Carrier selection | Persists selection, freezes quoted amount |
| Shipment creation | Calls correct courier API, stores response |
| Webhook status mapping | All 3 courier formats → Zippy status |
| Duplicate webhook handling | Idempotency — no duplicate events |
| Invalid status transition | Reject or handle gracefully |

---

## Deliverables (from Spec)

1. Source code
2. Database schema or migration scripts
3. README with setup instructions
4. Sample test data
5. API documentation or Postman collection
6. Unit tests
7. Short architecture explanation
8. Instructions for triggering courier-status events
9. Docker Compose preferred (frontend, backend, DB, mock couriers)

---

## Open Questions

1. **Pickup address storage** — The order form collects full pickup/delivery addresses (addressLine1,
   city, state, pincode), but the minimum data model only stores `pickup_pincode` and
   `delivery_pincode`. **Decision: Store full addresses in additional columns** since they're needed
   for the Order Details screen and could be needed by couriers in a real scenario.

2. **FastShip `estimated_days` mapping** — FastShip returns a single `estimated_days` value (not a
   range). **Decision: Map to both `estimatedMinDays` and `estimatedMaxDays`** with the same value.

3. **QuickExpress `quoteId` persistence** — QuickExpress returns a `quoteId` in its rate response
   that's required for shipment creation. **Decision: Store in `raw_carrier_response`** on the
   ShippingQuote entity and extract when needed.

4. **ReliableCourier weight unit** — The rate API takes `weight` in grams (query param), but the
   shipment creation API takes `parcelWeight` in KG. **Decision: Convert at the adapter layer**,
   storing canonical weight in grams in the Order.

5. **FastShip webhook identification** — FastShip webhook includes both `shipment_id` and
   `tracking_number`. **Decision: Use `shipment_id` (carrier_shipment_id) as the primary lookup key**
   for consistency, with `tracking_number` as a verification field.

6. **Order status vs Shipment status** — The spec mentions `ORDER_CREATED`, `CARRIER_SELECTED`,
   `SHIPMENT_CREATED` as order statuses, while shipment statuses are the tracking flow. **Decision:
   Maintain separate `order_status` on Order and `current_status` on Shipment** — the order status
   tracks the business flow, the shipment status tracks the physical delivery.

7. **ReliableCourier `proofOfDelivery`** — The webhook includes proof-of-delivery data for the
   `DELIVERED` status. **Decision: Store in `raw_event_payload`** for future reference. No separate
   table needed for this assignment scope.
