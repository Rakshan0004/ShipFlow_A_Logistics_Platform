# API Contracts — Zippy Mock Logistics Platform

## Overview

This document defines every endpoint in the system across two categories:
1. **Zippy APIs** — consumed by the React frontend
2. **Mock Courier APIs** — consumed by the Zippy backend (rate queries, shipment creation) and
   courier-to-Zippy webhooks

All Zippy APIs return JSON. Standard error responses use the shape:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Human-readable description",
  "details": { "field": "reason" }
}
```

---

## Zippy APIs (Frontend-Facing)

### 1. Create Order

**`POST /api/orders`**

Creates a new order and assigns a Zippy order ID.

**Request:**
```json
{
  "merchantOrderId": "MERCHANT-10001",
  "customer": {
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@example.com"
  },
  "pickupAddress": {
    "addressLine1": "15 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "deliveryAddress": {
    "addressLine1": "22 Connaught Place",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "package": {
    "weightGrams": 1500,
    "lengthCm": 20,
    "widthCm": 15,
    "heightCm": 10
  },
  "paymentType": "COD",
  "codAmount": 2500
}
```

**Response (201 Created):**
```json
{
  "orderId": "ZPY-ORD-10001",
  "merchantOrderId": "MERCHANT-10001",
  "orderStatus": "ORDER_CREATED",
  "createdAt": "2026-07-15T09:00:00Z"
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 400 | Missing required fields, invalid pincode format, COD amount missing when paymentType=COD, negative weight |
| 409 | Duplicate merchantOrderId (if enforced) |

---

### 2. Get Order

**`GET /api/orders/{orderId}`**

Retrieves full order details. `orderId` is the Zippy order ID (e.g. `ZPY-ORD-10001`).

**Response (200 OK):**
```json
{
  "orderId": "ZPY-ORD-10001",
  "merchantOrderId": "MERCHANT-10001",
  "customer": {
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul@example.com"
  },
  "pickupAddress": {
    "addressLine1": "15 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "deliveryAddress": {
    "addressLine1": "22 Connaught Place",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "package": {
    "weightGrams": 1500,
    "lengthCm": 20,
    "widthCm": 15,
    "heightCm": 10
  },
  "paymentType": "COD",
  "codAmount": 2500,
  "orderStatus": "ORDER_CREATED",
  "selectedCarrier": null,
  "shipment": null,
  "createdAt": "2026-07-15T09:00:00Z",
  "updatedAt": "2026-07-15T09:00:00Z"
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 404 | Order not found |

---

### 3. Request Rates

**`POST /api/orders/{orderId}/rates`**

Triggers rate fetching from all 3 couriers in parallel. Returns normalized results.

**Request:** No body required — order details are read from the database.

**Response (200 OK):**
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
    },
    {
      "carrierCode": "QUICKEXPRESS",
      "carrierName": "QuickExpress",
      "serviceCode": "EXPRESS",
      "serviceName": "QuickExpress Express",
      "baseCharge": 115.00,
      "codCharge": 40.00,
      "additionalCharges": 12.00,
      "tax": 30.06,
      "totalCharge": 197.06,
      "estimatedMinDays": 2,
      "estimatedMaxDays": 3
    },
    {
      "carrierCode": "RELIABLE",
      "carrierName": "ReliableCourier",
      "serviceCode": "RC-SURFACE",
      "serviceName": "Reliable Surface",
      "baseCharge": 95.00,
      "codCharge": 30.00,
      "additionalCharges": 10.00,
      "tax": 24.30,
      "totalCharge": 159.30,
      "estimatedMinDays": 4,
      "estimatedMaxDays": 5
    },
    {
      "carrierCode": "RELIABLE",
      "carrierName": "ReliableCourier",
      "serviceCode": "RC-AIR",
      "serviceName": "Reliable Air",
      "baseCharge": 130.00,
      "codCharge": 30.00,
      "additionalCharges": 12.00,
      "tax": 30.96,
      "totalCharge": 202.96,
      "estimatedMinDays": 2,
      "estimatedMaxDays": 3
    }
  ],
  "warnings": []
}
```

When a courier fails, its options are omitted and a warning is included:
```json
{
  "orderId": "ZPY-ORD-10001",
  "shippingOptions": [ /* only successful couriers */ ],
  "warnings": [
    {
      "carrierCode": "QUICKEXPRESS",
      "message": "QuickExpress is currently unavailable"
    }
  ]
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 404 | Order not found |
| 409 | Order already has a shipment (cannot re-quote) |

---

### 4. Get Cached Rates

**`GET /api/orders/{orderId}/rates`**

Returns previously fetched rates from the database (no new courier calls).

**Response (200 OK):** Same shape as POST response above.

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 404 | Order not found or no rates fetched yet |

---

### 5. Select Carrier

**`POST /api/orders/{orderId}/select-carrier`**

Locks in the merchant's carrier choice. Freezes the quoted amount.

**Request:**
```json
{
  "carrierCode": "FASTSHIP",
  "serviceCode": "FAST-AIR",
  "quotedAmount": 182.90
}
```

**Response (200 OK):**
```json
{
  "orderId": "ZPY-ORD-10001",
  "orderStatus": "CARRIER_SELECTED",
  "selectedCarrier": {
    "carrierCode": "FASTSHIP",
    "serviceCode": "FAST-AIR",
    "quotedAmount": 182.90,
    "selectedAt": "2026-07-15T09:05:00Z"
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 400 | Missing required fields |
| 404 | Order not found |
| 409 | Carrier already selected, or no rates available for this carrier/service combo |
| 422 | Quoted amount doesn't match stored quote (price mismatch check) |

---

### 6. Create Shipment

**`POST /api/orders/{orderId}/create-shipment`**

Calls the selected courier's shipment-creation API. Creates the Shipment record.

**Request:** No body — uses the previously selected carrier info.

**Response (201 Created):**
```json
{
  "orderId": "ZPY-ORD-10001",
  "orderStatus": "SHIPMENT_CREATED",
  "shipment": {
    "carrierCode": "FASTSHIP",
    "carrierShipmentId": "FS-700001",
    "trackingNumber": "FST123456789",
    "serviceCode": "FAST-AIR",
    "quotedAmount": 182.90,
    "currentStatus": "SHIPMENT_CREATED",
    "createdAt": "2026-07-15T09:06:00Z"
  }
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 404 | Order not found |
| 409 | Shipment already exists for this order |
| 422 | No carrier selected yet (must select first) |
| 502 | Courier shipment-creation API failed |

---

### 7. Get Tracking

**`GET /api/orders/{orderId}/tracking`**

Returns current shipment status and full event history.

**Response (200 OK):**
```json
{
  "orderId": "ZPY-ORD-10001",
  "shipment": {
    "carrierCode": "FASTSHIP",
    "trackingNumber": "FST123456789",
    "currentStatus": "IN_TRANSIT",
    "updatedAt": "2026-07-16T10:30:00Z"
  },
  "events": [
    {
      "status": "SHIPMENT_CREATED",
      "description": "Shipment booked with FastShip",
      "eventTime": "2026-07-15T09:06:00Z"
    },
    {
      "status": "PICKED_UP",
      "description": "Shipment picked up from merchant",
      "eventTime": "2026-07-15T14:00:00Z"
    },
    {
      "status": "IN_TRANSIT",
      "description": "Shipment departed Bengaluru hub",
      "location": "Bengaluru Hub",
      "eventTime": "2026-07-16T10:30:00Z"
    }
  ]
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 404 | Order not found or no shipment created |

---

## Webhook Endpoints (Courier → Zippy)

All webhook endpoints return `200 OK` on success (even for duplicates) to prevent courier
retries. They return `400` only for malformed payloads.

### 8. FastShip Webhook

**`POST /api/webhooks/fastship`**

**Payload:**
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

**Shipment lookup key:** `shipment_id` → `shipments.carrier_shipment_id`

**Idempotency key:** `"{shipment_id}_{event_code}"` → `shipment_events.carrier_event_id`

**Response (200 OK):**
```json
{ "status": "ACCEPTED" }
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| 400 | Malformed payload (missing required fields) |
| 200 | Unknown tracking number (accepted but logged for investigation) |
| 200 | Duplicate event (silently ignored, returns success) |

---

### 9. QuickExpress Webhook

**`POST /api/webhooks/quickexpress`**

**Payload:**
```json
{
  "awb": "QE987654321",
  "event": {
    "type": "OFD",
    "message": "Shipment is out for delivery",
    "occurredAt": "2026-07-17T08:15:00Z"
  },
  "facility": {
    "city": "New Delhi",
    "code": "DEL-01"
  }
}
```

**Shipment lookup key:** `awb` → `shipments.tracking_number`

**Idempotency key:** `"{awb}_{event.type}"` → `shipment_events.carrier_event_id`

**Response (200 OK):**
```json
{ "status": "ACCEPTED" }
```

---

### 10. ReliableCourier Webhook

**`POST /api/webhooks/reliable`**

**Payload:**
```json
{
  "trackingCode": "RC1122334455",
  "statusId": 50,
  "statusText": "Delivered",
  "updatedOn": "2026-07-19T15:45:00Z",
  "proofOfDelivery": {
    "receivedBy": "Rahul Sharma",
    "deliveryLocation": "New Delhi"
  }
}
```

**Shipment lookup key:** `trackingCode` → `shipments.tracking_number`

**Idempotency key:** `"{trackingCode}_{statusId}"` → `shipment_events.carrier_event_id`

**Response (200 OK):**
```json
{ "status": "ACCEPTED" }
```

---

## Mock Courier APIs (Called by Zippy Backend)

These are the APIs that the mock-courier service exposes. Their formats are **fixed contracts**
from the assignment spec — the Zippy backend must match them exactly.

> [!IMPORTANT]
> The JSON payloads below are copied verbatim from the original spec. Do not rename, restructure,
> or paraphrase any field — the mock couriers must return these exact shapes.

### FastShip Rate API

**`POST /fastship/api/v1/rate`**

**Request:**
```json
{
  "origin_pin": "560001",
  "destination_pin": "110001",
  "weight_kg": 1.5,
  "payment_mode": "COD",
  "invoice_value": 2500
}
```

**Response:**
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

---

### FastShip Shipment API

**`POST /fastship/api/v1/shipments`**

**Request:**
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

**Response:**
```json
{
  "success": true,
  "shipment_id": "FS-700001",
  "tracking_number": "FST123456789",
  "label_url": "http://mock-fastship/labels/FST123456789.pdf",
  "status": "BOOKED"
}
```

---

### QuickExpress Rate API

**`POST /quickexpress/rates/check`**

**Request:**
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

**Response:**
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

---

### QuickExpress Shipment API

**`POST /quickexpress/booking/create`**

**Request:**
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

**Response:**
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

---

### ReliableCourier Rate API

**`GET /reliablecourier/shipping-options`**

Query params: `from`, `to`, `weight`, `cod`, `amount`

Example: `GET /reliablecourier/shipping-options?from=560001&to=110001&weight=1500&cod=true&amount=2500`

**Response:**
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

---

### ReliableCourier Shipment API

**`PUT /reliablecourier/orders`**

Note: This uses `PUT`, not `POST`.

**Request:**
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

**Response:**
```json
{
  "result": "ACCEPTED",
  "deliveryOrder": { "id": "RC-DO-600001", "trackingCode": "RC1122334455" },
  "message": "Shipment successfully registered"
}
```

---

## Mock Courier — Status Trigger API (Custom)

These are custom APIs for the mock-courier app to allow manual testing of the webhook flow.

### Advance Shipment Status

**`POST /mock/shipments/{carrierId}/advance`**

Advances a mock shipment to the next status in the flow and sends the webhook to Zippy.

**Request:**
```json
{
  "trackingNumber": "FST123456789"
}
```

**Response (200 OK):**
```json
{
  "carrier": "FASTSHIP",
  "trackingNumber": "FST123456789",
  "previousStatus": "PICKED_UP",
  "newStatus": "IN_TRANSIT",
  "webhookSent": true
}
```

### Set Specific Status

**`POST /mock/shipments/{carrierId}/set-status`**

Sets a specific status (for testing edge cases like invalid transitions).

**Request:**
```json
{
  "trackingNumber": "FST123456789",
  "status": "DELIVERED"
}
```
