# Self-Audit of Planning Documents — Zippy Mock Logistics Platform

This audit compares the original assignment specification (`Zippyy_ai_document.pdf`) against all generated planning documents in `/docs/` and project configuration (`CLAUDE.md`).

---

## 1. Requirements Traceability Matrix

| Requirement (from spec) | Covered in (doc + section) | Status |
|-------------------------|----------------------------|--------|
| **Sample Order Request Fields** | | |
| `merchantOrderId` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `customer.name` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `customer.phone` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `customer.email` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `pickupAddress.addressLine1` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `pickupAddress.city` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `pickupAddress.state` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `pickupAddress.pincode` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `deliveryAddress.addressLine1` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `deliveryAddress.city` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `deliveryAddress.state` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `deliveryAddress.pincode` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `package.weightGrams` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `package.lengthCm` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `package.widthCm` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `package.heightCm` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `paymentType` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| `codAmount` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Step 1, `DATA_MODEL.md` § V1 | Covered |
| **FastShip Rate Request/Response** | | |
| Request: `origin_pin`, `destination_pin`, `weight_kg`, `payment_mode`, `invoice_value` | `API_CONTRACTS.md` § FastShip Rate API, `REQUIREMENTS.md` § Courier 1 | Covered |
| Response: `success`, `service.service_code`, `service.service_name`, `service.freight_charge`, `service.cod_charge`, `service.tax`, `service.total_amount`, `service.estimated_days` | `API_CONTRACTS.md` § FastShip Rate API, `REQUIREMENTS.md` § Courier 1, `COURIER_NORMALIZATION.md` § FastShip → Zippy Rate | Covered |
| **QuickExpress Rate Request/Response** | | |
| Request: `pickupPincode`, `deliveryPincode`, `weightInGrams`, `dimensions.length`, `dimensions.breadth`, `dimensions.height`, `isCod`, `collectableAmount` | `API_CONTRACTS.md` § QuickExpress Rate API, `REQUIREMENTS.md` § Courier 2 | Covered |
| Response: `status`, `quoteId`, `charges.shipping`, `charges.cod`, `charges.fuelSurcharge`, `charges.gst`, `payable`, `deliveryEstimate.minimumDays`, `deliveryEstimate.maximumDays`, `product` | `API_CONTRACTS.md` § QuickExpress Rate API, `REQUIREMENTS.md` § Courier 2, `COURIER_NORMALIZATION.md` § QuickExpress → Zippy Rate | Covered |
| **ReliableCourier Rate Request/Response** | | |
| Request (Query Params): `from`, `to`, `weight`, `cod`, `amount` | `API_CONTRACTS.md` § ReliableCourier Rate API, `REQUIREMENTS.md` § Courier 3 | Covered |
| Response: `code`, `data[].id`, `data[].name`, `data[].rate.base`, `data[].rate.handling`, `data[].rate.cashCollectionFee`, `data[].rate.taxAmount`, `data[].rate.grandTotal`, `data[].eta` | `API_CONTRACTS.md` § ReliableCourier Rate API, `REQUIREMENTS.md` § Courier 3, `COURIER_NORMALIZATION.md` § ReliableCourier → Zippy Rate | Covered |
| **Zippy Normalized Rate Response** | | |
| `orderId`, `shippingOptions[].carrierCode`, `carrierName`, `serviceCode`, `serviceName`, `baseCharge`, `codCharge`, `additionalCharges`, `tax`, `totalCharge`, `estimatedMinDays`, `estimatedMaxDays` | `API_CONTRACTS.md` § 3, `REQUIREMENTS.md` § Step 3, `COURIER_NORMALIZATION.md` § Rate Response Field Mapping | Covered |
| **FastShip Shipment Creation Request/Response** | | |
| Request: `reference_number`, `service_code`, `shipper.name`, `shipper.postal_code`, `consignee.name`, `consignee.phone`, `consignee.postal_code`, `parcel.weight_kg`, `cod.enabled`, `cod.amount`, `callback_url` | `API_CONTRACTS.md` § FastShip Shipment API, `REQUIREMENTS.md` § Courier 1 | Covered |
| Response: `success`, `shipment_id`, `tracking_number`, `label_url`, `status` | `API_CONTRACTS.md` § FastShip Shipment API, `REQUIREMENTS.md` § Courier 1 | Covered |
| **QuickExpress Shipment Creation Request/Response** | | |
| Request: `clientOrderId`, `quoteId`, `productType`, `receiverDetails.fullName`, `receiverDetails.mobileNumber`, `receiverDetails.postalCode`, `packageDetails.deadWeight`, `packageDetails.weightUnit`, `payment.mode`, `payment.amountToCollect`, `webhook` | `API_CONTRACTS.md` § QuickExpress Shipment API, `REQUIREMENTS.md` § Courier 2 | Covered |
| Response: `bookingStatus`, `booking.bookingId`, `booking.awb`, `booking.currentState` | `API_CONTRACTS.md` § QuickExpress Shipment API, `REQUIREMENTS.md` § Courier 2 | Covered |
| **ReliableCourier Shipment Creation Request/Response** | | |
| Request: `orderReference`, `selectedOption`, `destination.contact`, `destination.phone`, `destination.zip`, `parcelWeight.value`, `parcelWeight.unit`, `collectionType`, `collectionAmount`, `statusNotificationUrl` | `API_CONTRACTS.md` § ReliableCourier Shipment API, `REQUIREMENTS.md` § Courier 3 | Covered |
| Response: `result`, `deliveryOrder.id`, `deliveryOrder.trackingCode`, `message` | `API_CONTRACTS.md` § ReliableCourier Shipment API, `REQUIREMENTS.md` § Courier 3 | Covered |
| **Webhook Payload Formats** | | |
| FastShip: `shipment_id`, `tracking_number`, `event_code`, `event_description`, `event_time`, `location` | `API_CONTRACTS.md` § 8, `REQUIREMENTS.md` § Courier 1, `COURIER_NORMALIZATION.md` § Webhook Event Field Mapping | Covered |
| QuickExpress: `awb`, `event.type`, `event.message`, `event.occurredAt`, `facility.city`, `facility.code` | `API_CONTRACTS.md` § 9, `REQUIREMENTS.md` § Courier 2, `COURIER_NORMALIZATION.md` § Webhook Event Field Mapping | Covered |
| ReliableCourier: `trackingCode`, `statusId`, `statusText`, `updatedOn`, `proofOfDelivery.receivedBy`, `proofOfDelivery.deliveryLocation` | `API_CONTRACTS.md` § 10, `REQUIREMENTS.md` § Courier 3, `COURIER_NORMALIZATION.md` § Webhook Event Field Mapping | Covered |
| **7-Row Status Mapping Table** | | |
| `SHIPMENT_CREATED` → FastShip: `BOOKED` \| QuickExpress: `SC` \| ReliableCourier: `10` | `COURIER_NORMALIZATION.md` § Status Normalization Table, `REQUIREMENTS.md` § Zippy Status Enum | Covered |
| `PICKED_UP` → FastShip: `PICKED_UP` \| QuickExpress: `PU` \| ReliableCourier: `20` | `COURIER_NORMALIZATION.md` § Status Normalization Table, `REQUIREMENTS.md` § Zippy Status Enum | Covered |
| `IN_TRANSIT` → FastShip: `IN_TRANSIT` \| QuickExpress: `IT` \| ReliableCourier: `30` | `COURIER_NORMALIZATION.md` § Status Normalization Table, `REQUIREMENTS.md` § Zippy Status Enum | Covered |
| `OUT_FOR_DELIVERY` → FastShip: `OUT_FOR_DELIVERY` \| QuickExpress: `OFD` \| ReliableCourier: `40` | `COURIER_NORMALIZATION.md` § Status Normalization Table, `REQUIREMENTS.md` § Zippy Status Enum | Covered |
| `DELIVERED` → FastShip: `DELIVERED` \| QuickExpress: `DLV` \| ReliableCourier: `50` | `COURIER_NORMALIZATION.md` § Status Normalization Table, `REQUIREMENTS.md` § Zippy Status Enum | Covered |
| `DELIVERY_FAILED` → FastShip: `DELIVERY_FAILED` \| QuickExpress: `NDR` \| ReliableCourier: `60` | `COURIER_NORMALIZATION.md` § Status Normalization Table, `REQUIREMENTS.md` § Zippy Status Enum | Covered |
| `RTO` → FastShip: `RETURNED` \| QuickExpress: `RTO` \| ReliableCourier: `70` | `COURIER_NORMALIZATION.md` § Status Normalization Table, `REQUIREMENTS.md` § Zippy Status Enum | Covered |
| **Minimum Data Model (4 Entities)** | | |
| `Order`: `id`, `zippy_order_id`, `merchant_order_id`, `customer_name`, `customer_phone`, `customer_email`, `pickup_pincode`, `delivery_pincode`, `weight_grams`, `length_cm`, `width_cm`, `height_cm`, `payment_type`, `cod_amount`, `order_status`, `created_at`, `updated_at` | `DATA_MODEL.md` § ERD & V1 SQL script, `REQUIREMENTS.md` § Minimum Data Model | Covered |
| `Shipping Quote`: `id`, `order_id`, `carrier_code`, `service_code`, `service_name`, `base_charge`, `cod_charge`, `additional_charges`, `tax`, `total_charge`, `estimated_min_days`, `estimated_max_days`, `raw_carrier_response`, `created_at` | `DATA_MODEL.md` § ERD & V2 SQL script, `REQUIREMENTS.md` § Minimum Data Model | Covered |
| `Shipment`: `id`, `order_id`, `carrier_code`, `carrier_shipment_id`, `tracking_number`, `selected_service_code`, `quoted_amount`, `current_status`, `created_at`, `updated_at` | `DATA_MODEL.md` § ERD & V3 SQL script, `REQUIREMENTS.md` § Minimum Data Model | Covered |
| `Shipment Event`: `id`, `shipment_id`, `carrier_event_id`, `carrier_status`, `normalized_status`, `description`, `location`, `event_time`, `raw_event_payload`, `received_at` | `DATA_MODEL.md` § ERD & V4 SQL script, `REQUIREMENTS.md` § Minimum Data Model | Covered |
| **Important Technical Requirements (10 Items)** | | |
| 1. Use a frontend framework (React, Angular, Vue) | `ARCHITECTURE.md` § Technology Choices, `SPRINT_PLAN.md` Sprint 0/6 (React via Vite) | Covered |
| 2. Use a backend framework (Spring Boot, Node.js, .NET) | `ARCHITECTURE.md` § Technology Choices, `SPRINT_PLAN.md` (Spring Boot 3.x) | Covered |
| 3. Save orders, quotes, shipments, and events in a database | `DATA_MODEL.md` § ERD & V1-V4 scripts, `ARCHITECTURE.md` (PostgreSQL) | Covered |
| 4. Integrate with all three mock courier services | `ARCHITECTURE.md` § High-Level Diagram, `REQUIREMENTS.md`, `SPRINT_PLAN.md` | Covered |
| 5. Normalize different courier request and response formats | `COURIER_NORMALIZATION.md`, `ARCHITECTURE.md` § Adapter Pattern | Covered |
| 6. Handle one courier unavailable without failing entire rate request | `EDGE_CASES_AND_FAILURE_HANDLING.md` § 1, `ARCHITECTURE.md` § Concurrency | Covered |
| 7. Prevent duplicate webhook events from creating duplicate status records | `EDGE_CASES_AND_FAILURE_HANDLING.md` § 3, `DATA_MODEL.md` § Idempotency Key | Covered |
| 8. Validate order and shipment requests | `API_CONTRACTS.md`, `SPRINT_PLAN.md` Sprint 1/4, `skills/spring-boot-module.md` | Covered |
| 9. Return appropriate HTTP status codes | `API_CONTRACTS.md` error tables, `EDGE_CASES_AND_FAILURE_HANDLING.md` | Covered |
| 10. Include clear setup instructions | `CLAUDE.md` § How to Run Locally, `SPRINT_PLAN.md` Sprint 8 | Covered |
| **Failure Scenarios to Handle (6 Items)** | | |
| 1. One Carrier Is Down (QuickExpress 500 error) | `EDGE_CASES_AND_FAILURE_HANDLING.md` § 1 | Covered |
| 2. Carrier Timeout | `EDGE_CASES_AND_FAILURE_HANDLING.md` § 2, `ARCHITECTURE.md` § Concurrency | Covered |
| 3. Duplicate Webhook | `EDGE_CASES_AND_FAILURE_HANDLING.md` § 3, `DATA_MODEL.md` § Idempotency Key | Covered |
| 4. Unknown Tracking Number | `EDGE_CASES_AND_FAILURE_HANDLING.md` § 4 | Covered |
| 5. Invalid Status Transition (DELIVERED → IN_TRANSIT) | `EDGE_CASES_AND_FAILURE_HANDLING.md` § 5, `COURIER_NORMALIZATION.md` § State Machine | Covered |
| 6. Price Change After Quote | `EDGE_CASES_AND_FAILURE_HANDLING.md` § 6 | Covered |
| **Testing Expectations (9 Items)** | | |
| 1. Order creation | `TESTING_STRATEGY.md` § OrderServiceTest, OrderControllerTest | Covered |
| 2. Courier-response normalization | `TESTING_STRATEGY.md` § FastShipClientTest, QuickExpressClientTest, ReliableCourierClientTest | Covered |
| 3. Rate sorting | `TESTING_STRATEGY.md` § RateAggregationServiceTest | Covered |
| 4. One courier failing | `TESTING_STRATEGY.md` § RateAggregationServiceTest | Covered |
| 5. Carrier selection | `TESTING_STRATEGY.md` § CarrierSelectionServiceTest, CarrierSelectionControllerTest | Covered |
| 6. Shipment creation | `TESTING_STRATEGY.md` § ShipmentServiceTest, ShipmentControllerTest | Covered |
| 7. Webhook status mapping | `TESTING_STRATEGY.md` § Courier client adapter tests | Covered |
| 8. Duplicate webhook handling | `TESTING_STRATEGY.md` § WebhookProcessingServiceTest | Covered |
| 9. Invalid status transition | `TESTING_STRATEGY.md` § WebhookProcessingServiceTest | Covered |
| **Deliverables (8 Items)** | | |
| 1. Source code | `SPRINT_PLAN.md` Sprint 0–6 | Covered |
| 2. Database schema or migration scripts | `DATA_MODEL.md` V1–V4 Flyway scripts, `SPRINT_PLAN.md` Sprint 0 | Covered |
| 3. README with setup instructions | `CLAUDE.md`, `SPRINT_PLAN.md` Sprint 8 | Covered |
| 4. Sample test data | `TESTING_STRATEGY.md` § Fixtures, `SPRINT_PLAN.md` Sprint 8 | Covered |
| 5. API documentation or Postman collection | `API_CONTRACTS.md`, `SPRINT_PLAN.md` Sprint 8 | Covered |
| 6. Unit tests | `TESTING_STRATEGY.md`, `SPRINT_PLAN.md` Sprint 7 | Covered |
| 7. Short explanation of application architecture | `ARCHITECTURE.md`, `CLAUDE.md`, `README.md` | Covered |
| 8. Instructions for triggering courier-status events | `API_CONTRACTS.md` § Mock Status Trigger API, `SPRINT_PLAN.md` Sprint 8 | Covered |
| **Suggested Zippy API List (All 10 Endpoints)** | | |
| `POST /api/orders` | `API_CONTRACTS.md` § 1, `REQUIREMENTS.md` § Suggested Zippy APIs | Covered |
| `GET /api/orders/{orderId}` | `API_CONTRACTS.md` § 2, `REQUIREMENTS.md` § Suggested Zippy APIs | Covered |
| `POST /api/orders/{orderId}/rates` | `API_CONTRACTS.md` § 3, `REQUIREMENTS.md` § Suggested Zippy APIs | Covered |
| `GET /api/orders/{orderId}/rates` | `API_CONTRACTS.md` § 4, `REQUIREMENTS.md` § Suggested Zippy APIs | Covered |
| `POST /api/orders/{orderId}/select-carrier` | `API_CONTRACTS.md` § 5, `REQUIREMENTS.md` § Suggested Zippy APIs | Covered |
| `POST /api/orders/{orderId}/create-shipment` | `API_CONTRACTS.md` § 6, `REQUIREMENTS.md` § Suggested Zippy APIs | Covered |
| `GET /api/orders/{orderId}/tracking` | `API_CONTRACTS.md` § 7, `REQUIREMENTS.md` § Suggested Zippy APIs | Covered |
| `POST /api/webhooks/fastship` | `API_CONTRACTS.md` § 8, `REQUIREMENTS.md` § Suggested Zippy APIs | Covered |
| `POST /api/webhooks/quickexpress` | `API_CONTRACTS.md` § 9, `REQUIREMENTS.md` § Suggested Zippy APIs | Covered |
| `POST /api/webhooks/reliable` | `API_CONTRACTS.md` § 10, `REQUIREMENTS.md` § Suggested Zippy APIs | Covered |

---

## 2. Design-Decision Check

| Decision | Made Explicitly? | Written Rationale Location | Rationale Summary |
|----------|------------------|---------------------------|-------------------|
| **Mock courier structure:** separate apps vs. isolated packages | Yes | `ARCHITECTURE.md` § Mock Courier Structure Decision (lines 177–198) | Single Spring Boot application with isolated packages per courier (`com.zippy.mockcourier.fastship`, etc.) balances JVM performance and fast setup while maintaining clean code isolation for a take-home project. |
| **Carrier selection and shipment creation:** combined into one API vs. two | Yes | `ARCHITECTURE.md` § Carrier Selection + Shipment Creation (lines 224–242) | Two separate APIs (`/select-carrier` and `/create-shipment`) provide an explicit confirmation step, separate local DB state updates from external HTTP side-effects, and match the spec's suggested API list. |
| **Invalid status transition handling:** (e.g. `DELIVERED` → `IN_TRANSIT`) | Yes | `COURIER_NORMALIZATION.md` § Handling Invalid Transitions (lines 171–199), `EDGE_CASES_AND_FAILURE_HANDLING.md` § 5 | Rejected with log recording at WARN level and no status-history entry created, while returning HTTP 200 OK to the courier to prevent endless webhook retries. |
| **Idempotency mechanism for duplicate webhooks:** (actual dedup key) | Yes | `DATA_MODEL.md` § Idempotency Key Strategy (lines 228–240), `EDGE_CASES_AND_FAILURE_HANDLING.md` § 3 | Database-enforced partial unique index on `shipment_events(shipment_id, carrier_event_id)` using courier-specific composite strings (`"{shipment_id}_{event_code}"`, `"{awb}_{event.type}"`, `"{trackingCode}_{statusId}"`). Duplicate inserts trigger `DataIntegrityViolationException` and return 200 OK. |
| **Timeout value and partial failure handling:** for courier rate calls | Yes | `ARCHITECTURE.md` § Concurrency / Timeout Strategy (lines 246–285), `EDGE_CASES_AND_FAILURE_HANDLING.md` § 1–2 | Per-courier 2s connect / 5s read timeout via `WebClient` + `CompletableFuture.orTimeout(5s)`. When one courier times out or returns 500, `exceptionally()` catches it and returns empty results for that courier, while returning remaining courier rates alongside a `warnings` array in an HTTP 200 response. |
| **Unknown tracking number webhook handling:** reject vs. safely record for investigation | Yes | `EDGE_CASES_AND_FAILURE_HANDLING.md` § 4 (lines 78–98) | Log the full raw payload at WARN level and return HTTP 200 to the courier (preventing retries); do not persist an orphan event record. A dead-letter table was considered and rejected as overkill for assignment scope. |

---

## 3. Internal Consistency Check

### Document Alignment (`ARCHITECTURE.md`, `DATA_MODEL.md`, `API_CONTRACTS.md`)
- **Field Consistency**: Every field defined in the `DATA_MODEL.md` entities (`ORDER`, `SHIPPING_QUOTE`, `SHIPMENT`, `SHIPMENT_EVENT`) corresponds directly to the request/response payloads in `API_CONTRACTS.md` (with explicit mapping between Java/JSON camelCase and SQL snake_case handled by mappers).
- **Endpoint Alignment**: All Zippy frontend endpoints and webhook endpoints in `API_CONTRACTS.md` match the controller and service components outlined in `ARCHITECTURE.md`.
- **Mock Courier Payload Alignment**: `API_CONTRACTS.md` § Mock Courier APIs now contains the full inline JSON payloads for all 3 couriers' rate and shipment-creation APIs, verified field-by-field against the original spec. No cross-document lookups required during implementation.

### Sprint Plan Grounding (`SPRINT_PLAN.md`)
- **Task Completeness**: The 9 sprints (Sprint 0 through Sprint 8) systematically cover every requirement, architectural layer, database schema migration (V1–V4), failure handling mechanism, frontend screen, unit/integration test, and deliverable specified across all docs.
- **No Groundless Tasks**: Every task in `SPRINT_PLAN.md` maps directly to a section in `REQUIREMENTS.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `API_CONTRACTS.md`, `COURIER_NORMALIZATION.md`, `EDGE_CASES_AND_FAILURE_HANDLING.md`, or `TESTING_STRATEGY.md`.

### Skill Playbook Validation (`/docs/skills/`)
- All 4 playbook files (`courier-adapter.md`, `react-screen.md`, `spring-boot-module.md`, `webhook-handler.md`) reference package structures, component patterns, error response shapes, and naming conventions that strictly align with `CLAUDE.md` and the core architecture documents. No dangling or ungrounded convention references were found.

---

## 4. Gaps to Fix

All previously identified gaps have been resolved:

1. ~~**Inline Mock Courier Payload Contracts in `API_CONTRACTS.md`**~~ — **Fixed.** All 6 mock courier API payloads (3 rate + 3 shipment-creation) are now inlined verbatim in `API_CONTRACTS.md` § Mock Courier APIs, verified field-by-field against the original `Zippyy.ai document.docx`. No field was paraphrased, renamed, or restructured.

2. ~~**Unknown Tracking Number design decision not in decision table**~~ — **Fixed.** Added as an explicit row in the Design-Decision Check (§ 2) with rationale: log + 200, no orphan record.

**No remaining gaps.** All requirements from the spec are fully covered and traceable. All design decisions are explicit with written rationales. All documents are internally consistent.
