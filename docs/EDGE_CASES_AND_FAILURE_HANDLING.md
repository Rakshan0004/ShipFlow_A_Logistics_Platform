# Edge Cases and Failure Handling — Zippy Mock Logistics Platform

Every failure scenario from the spec, mapped to its handling mechanism.

---

## 1. One Carrier Is Down

**Scenario:** QuickExpress returns HTTP 500 during rate aggregation.

**Mechanism:** `CompletableFuture.exceptionally()` in `RateAggregationService`.

Each courier call runs in a separate `CompletableFuture`. If one throws (HTTP error, connection
refused, etc.), the `exceptionally` handler catches it, logs a warning, and returns an empty
list. The other couriers' results are collected normally.

```
Input:  3 courier calls (FastShip ✓, QuickExpress ✗ 500, ReliableCourier ✓)
Output: shippingOptions from FastShip + ReliableCourier, warnings: ["QuickExpress unavailable"]
```

**Response behavior:** HTTP 200 with partial results + `warnings` array. Not a 500.

**Test:** `RateAggregationServiceTest.shouldReturnPartialRatesWhenOneCourierFails()`

---

## 2. Carrier Timeout

**Scenario:** ReliableCourier takes 30 seconds to respond.

**Mechanism:** Two layers of timeout defense.

| Layer | Setting | Purpose |
|-------|---------|---------|
| `WebClient` connect timeout | 2s | Fail fast if host is unreachable |
| `WebClient` read timeout | 5s | Cap time waiting for response body |
| `CompletableFuture.orTimeout()` | 5s | Hard cap at the async-call level |

When the timeout fires, the `CompletableFuture` completes exceptionally with
`TimeoutException`. The same `exceptionally()` handler from scenario #1 catches it.

**Result:** Same as "one carrier is down" — partial results returned, warning logged.

**Test:** `RateAggregationServiceTest.shouldTimeoutSlowCourier()`

---

## 3. Duplicate Webhook

**Scenario:** FastShip sends the `IN_TRANSIT` event twice for shipment `FS-700001`.

**Mechanism:** Unique DB constraint on `(shipment_id, carrier_event_id)`.

**Flow:**
1. First event arrives → `carrier_event_id = "FS-700001_IN_TRANSIT"` → INSERT succeeds →
   `current_status` updated to `IN_TRANSIT` → return 200.
2. Second identical event arrives → same `carrier_event_id` → INSERT violates unique constraint →
   `DataIntegrityViolationException` caught → log at DEBUG level → return 200 to courier.

**Why return 200?** Couriers typically retry on non-2xx responses. Returning 200 stops the retry
loop. From the courier's perspective, the event was "accepted" (because it was, the first time).

**Idempotency key construction per courier:**

| Courier | Idempotency Key | Example |
|---------|-----------------|---------|
| FastShip | `{shipment_id}_{event_code}` | `FS-700001_IN_TRANSIT` |
| QuickExpress | `{awb}_{event.type}` | `QE987654321_OFD` |
| ReliableCourier | `{trackingCode}_{statusId}` | `RC1122334455_50` |

**Test:** `WebhookProcessingServiceTest.shouldIgnoreDuplicateWebhookEvent()`

---

## 4. Unknown Tracking Number

**Scenario:** A webhook arrives for tracking number `FST999999999` which doesn't exist in
our `shipments` table.

**Mechanism:** Shipment lookup returns empty → reject gracefully.

**Flow:**
1. Parse webhook payload → extract tracking/shipment identifier.
2. Query `shipments` table by `carrier_shipment_id` (FastShip) or `tracking_number`
   (QuickExpress, ReliableCourier).
3. If not found:
   - Log at WARN with the full raw payload for investigation.
   - Return HTTP 200 (to prevent courier retries).
   - Do NOT persist the event (no orphan records).

**Why 200 instead of 404?** A 404 might cause the courier to retry indefinitely. The courier
doesn't need to know about our internal lookup failure. We log everything needed for debugging.

**Alternative considered:** Storing in a `dead_letter_webhooks` table. Decided against for
assignment scope — WARN-level logging with the raw payload is sufficient.

**Test:** `WebhookProcessingServiceTest.shouldHandleUnknownTrackingNumber()`

---

## 5. Invalid Status Transition

**Scenario:** Shipment is `DELIVERED`, courier sends `IN_TRANSIT` event.

**Mechanism:** Status state-machine validation in `WebhookProcessingService`.

**Flow:**
1. Parse webhook → normalize status → get `newStatus = IN_TRANSIT`.
2. Look up current shipment status → `DELIVERED`.
3. Check `VALID_TRANSITIONS.get("DELIVERED")` → empty set (terminal state).
4. `IN_TRANSIT` is not in the allowed set → reject.
5. Log at WARN: `"Invalid transition: DELIVERED → IN_TRANSIT for shipment FS-700001"`.
6. Return HTTP 200 to courier (prevent retries).
7. Do NOT update `current_status`. Do NOT create a `shipment_events` record.

**Valid transition map** (see [COURIER_NORMALIZATION.md](./COURIER_NORMALIZATION.md)):
```
SHIPMENT_CREATED → [PICKED_UP]
PICKED_UP        → [IN_TRANSIT]
IN_TRANSIT       → [OUT_FOR_DELIVERY, DELIVERY_FAILED]
OUT_FOR_DELIVERY → [DELIVERED, DELIVERY_FAILED]
DELIVERY_FAILED  → [OUT_FOR_DELIVERY, RTO]
DELIVERED        → [] (terminal)
RTO              → [] (terminal)
```

**Test:** `WebhookProcessingServiceTest.shouldRejectInvalidStatusTransition()`

---

## 6. Price Change After Quote

**Scenario:** Merchant selects FastShip at ₹182.90. Later, FastShip raises rates to ₹220.00.
The merchant's shipment should still show ₹182.90.

**Mechanism:** Quote snapshot at selection time.

**Flow:**
1. `POST /api/orders/{id}/rates` → stores all quotes in `shipping_quotes` table with
   `total_charge = 182.90`.
2. `POST /api/orders/{id}/select-carrier` → request includes `quotedAmount: 182.90` →
   backend verifies it matches the stored quote → creates Shipment record with
   `quoted_amount = 182.90`.
3. Even if `POST /api/orders/{id}/rates` is called again (re-quoting), the `shipments.quoted_amount`
   is already frozen and never changes.

**Double-check mechanism:** The `select-carrier` endpoint compares the `quotedAmount` from the
request against the stored `shipping_quotes.total_charge`. If they don't match (e.g., rates
were re-fetched between quoting and selection), it returns HTTP 422 with a message asking the
merchant to re-select.

**Test:** `CarrierSelectionServiceTest.shouldFreezeQuotedAmountOnSelection()`

---

## 7. All Couriers Fail During Rate Aggregation

**Scenario:** All 3 couriers are down simultaneously.

**Mechanism:** Not explicitly in the spec, but a natural extension of scenario #1.

**Flow:**
1. All 3 `CompletableFuture`s complete exceptionally.
2. `shippingOptions` is an empty list.
3. `warnings` contains all 3 couriers.
4. Response is HTTP 200 with empty options — the frontend shows "No shipping options available.
   Please try again later."

**Test:** `RateAggregationServiceTest.shouldReturnEmptyOptionsWhenAllCouriersFail()`

---

## 8. Malformed Webhook Payload

**Scenario:** Courier sends a webhook with missing required fields (e.g. no `event_code`).

**Mechanism:** Request validation + Jackson deserialization error handling.

**Flow:**
1. `@RequestBody` deserialization fails or required fields are null after parsing.
2. Catch `HttpMessageNotReadableException` or validate manually.
3. Return HTTP 400 with error details (it's appropriate here — the courier should fix
   its payload, so a 4xx is correct).

**Test:** `WebhookControllerTest.shouldReturn400ForMalformedPayload()`

---

## 9. Concurrent Webhook Events for Same Shipment

**Scenario:** Two webhook events arrive simultaneously for the same shipment (e.g., `PICKED_UP`
and `IN_TRANSIT` arrive at the same instant).

**Mechanism:** Database-level optimistic locking on `shipments.updated_at`.

**Flow:**
1. Both requests read current status (`SHIPMENT_CREATED`).
2. First request: `SHIPMENT_CREATED → PICKED_UP` ✓ → updates `current_status` and `updated_at`.
3. Second request: tries `SHIPMENT_CREATED → IN_TRANSIT` but `updated_at` has changed →
   `OptimisticLockException` → retry with fresh state.
4. On retry: reads `PICKED_UP`, validates `PICKED_UP → IN_TRANSIT` ✓ → succeeds.

Alternatively, use `@Transactional` with `SERIALIZABLE` isolation for webhook processing
(acceptable for this assignment's throughput).

**Test:** `WebhookProcessingServiceTest.shouldHandleConcurrentWebhookEvents()` (integration test)

---

## Summary Table

| # | Failure Scenario | Handling Mechanism | HTTP Response | Test Class |
|---|------------------|--------------------|---------------|------------|
| 1 | One carrier down | `CompletableFuture.exceptionally()` | 200 + partial results | `RateAggregationServiceTest` |
| 2 | Carrier timeout | `WebClient` + `orTimeout()` | 200 + partial results | `RateAggregationServiceTest` |
| 3 | Duplicate webhook | Unique DB constraint on `(shipment_id, carrier_event_id)` | 200 | `WebhookProcessingServiceTest` |
| 4 | Unknown tracking | Shipment lookup miss → log + 200 | 200 | `WebhookProcessingServiceTest` |
| 5 | Invalid transition | State-machine check → reject + log | 200 | `WebhookProcessingServiceTest` |
| 6 | Price change | `quoted_amount` frozen at selection, verified on select | 422 if mismatch | `CarrierSelectionServiceTest` |
| 7 | All couriers fail | Same as #1, empty results | 200 + empty options | `RateAggregationServiceTest` |
| 8 | Malformed webhook | Validation / deserialization error | 400 | `WebhookControllerTest` |
| 9 | Concurrent webhooks | Optimistic locking / serializable TX | 200 (after retry) | `WebhookProcessingServiceTest` |
