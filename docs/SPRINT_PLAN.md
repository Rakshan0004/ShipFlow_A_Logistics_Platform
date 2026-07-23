# Sprint Plan — Zippy Mock Logistics Platform

## Sprint Overview

| Sprint | Goal | Estimated Effort |
|--------|------|------------------|
| 0 | Repo scaffolding, build system, local run | Foundation |
| 1 | Order domain — CRUD, validation, persistence | Core entity |
| 2 | Mock courier services — all 3, matching exact contracts | External deps |
| 3 | Rate aggregation — parallel calls, normalization, failure handling | Integration |
| 4 | Carrier selection + shipment creation | Transaction flow |
| 5 | Webhooks — ingestion, normalization, idempotency, status history | Event processing |
| 6 | React frontend — 3 screens, polling for updates | UI |
| 7 | Test suite completion | Quality |
| 8 | README, Postman collection, sample data, polish | Deliverables |

---

## Sprint 0: Repo Scaffolding

### Goal
Set up the multi-module Gradle project, Docker Compose skeleton, and verify everything
compiles and runs locally.

### Tasks

- [ ] Initialize Gradle multi-module project (Kotlin DSL) with `zippy-backend`,
      `mock-courier-service` modules
- [ ] Configure Spring Boot starters: web, data-jpa, validation, webflux (for WebClient)
- [ ] Set up `application.yml` with PostgreSQL datasource (Docker Compose)
- [ ] Create Flyway migration directory structure
- [ ] Run all 4 migration scripts (V1–V4) from DATA_MODEL.md
- [ ] Create `docker-compose.yml` with services: postgres, zippy-backend, mock-courier,
      zippy-frontend
- [ ] Initialize React app with Vite in `zippy-frontend/`
- [ ] Create `run-local.sh` / `run-local.bat` scripts for non-Docker local development
- [ ] Verify: `./gradlew build` passes, PostgreSQL tables created via Flyway

### Files Touched

```
build.gradle.kts, settings.gradle.kts
zippy-backend/build.gradle.kts
mock-courier-service/build.gradle.kts
docker-compose.yml
zippy-backend/src/main/resources/application.yml
zippy-backend/src/main/resources/db/migration/V1–V4__*.sql
zippy-frontend/package.json (+ Vite scaffold)
run-local.sh, run-local.bat
```

### Done When
- `./gradlew build` succeeds with no test failures
- Both Spring Boot apps start (backend port 8080, mock-courier port 8081)
- React dev server starts on port 3000
- PostgreSQL running via Docker Compose, Flyway creates all 4 tables
- Docker Compose `up` starts all services

### Docs to Update
- `CLAUDE.md` — add actual run commands once verified

---

## Sprint 1: Order Domain

### Goal
Full CRUD for orders: create, get, validate, persist. Zippy order ID generation.

### Tasks

- [ ] Create JPA entity: `Order` with all fields from DATA_MODEL.md
- [ ] Create DTOs: `CreateOrderRequest`, `OrderResponse`, `AddressDto`, `PackageDto`
- [ ] Create mapper: `OrderMapper` (entity ↔ DTO)
- [ ] Create repository: `OrderRepository extends JpaRepository`
- [ ] Create service: `OrderService` — create (validate, generate ID, persist), get by ID
- [ ] Implement Zippy order ID generation: `ZPY-ORD-{sequence}`
- [ ] Implement validation: required fields, pincode format, COD logic, weight > 0
- [ ] Create controller: `OrderController` — POST /api/orders, GET /api/orders/{orderId}
- [ ] Create exception classes: `OrderNotFoundException`, `ValidationException`
- [ ] Create global exception handler: `@ControllerAdvice`
- [ ] Write unit tests: `OrderServiceTest` (7 tests from TESTING_STRATEGY.md)
- [ ] Write controller tests: `OrderControllerTest` (3 tests)

### Files Touched

```
zippy-backend/src/main/java/com/zippy/backend/
├── model/Order.java
├── dto/CreateOrderRequest.java, OrderResponse.java, AddressDto.java, PackageDto.java
├── mapper/OrderMapper.java
├── repository/OrderRepository.java
├── service/OrderService.java
├── controller/OrderController.java
├── exception/OrderNotFoundException.java, ValidationException.java
└── exception/GlobalExceptionHandler.java
zippy-backend/src/test/...
```

### Done When
- `POST /api/orders` creates an order, returns 201 with Zippy ID
- `GET /api/orders/{id}` returns full order details
- Validation rejects invalid input with 400 + details
- All 10 unit + controller tests pass

### Docs to Update
- None expected — this sprint follows the plan directly

---

## Sprint 2: Mock Courier Services

### Goal
Implement all 3 mock courier endpoints (rate + shipment creation) in the mock-courier-service
module, matching exact API contracts from the spec.

### Tasks

- [ ] Create FastShip rate endpoint: `POST /fastship/api/v1/rate`
- [ ] Create FastShip shipment endpoint: `POST /fastship/api/v1/shipments`
- [ ] Create QuickExpress rate endpoint: `POST /quickexpress/rates/check`
- [ ] Create QuickExpress shipment endpoint: `POST /quickexpress/booking/create`
- [ ] Create ReliableCourier rate endpoint: `GET /reliablecourier/shipping-options`
- [ ] Create ReliableCourier shipment endpoint: `PUT /reliablecourier/orders`
- [ ] Implement in-memory `MockShipmentStore` (tracks created shipments + current status)
- [ ] Implement configurable failure mode (e.g. `?fail=true` query param for testing 500s)
- [ ] Implement configurable delay (e.g. `?delay=10000` for timeout testing)
- [ ] Write controller tests for all 6 mock endpoints

### Files Touched

```
mock-courier-service/src/main/java/com/zippy/mockcourier/
├── fastship/FastShipController.java, FastShipService.java, dto/*
├── quickexpress/QuickExpressController.java, QuickExpressService.java, dto/*
├── reliable/ReliableCourierController.java, ReliableCourierService.java, dto/*
└── common/MockShipmentStore.java
mock-courier-service/src/test/...
```

### Done When
- All 6 endpoints return responses exactly matching spec formats
- `?fail=true` returns 500
- `?delay=N` adds artificial delay
- Shipment creation stores the shipment in memory for later webhook triggering
- All mock endpoint tests pass

### Docs to Update
- `API_CONTRACTS.md` if any clarification is needed on mock API behavior

---

## Sprint 3: Rate Aggregation

### Goal
Implement parallel courier calls from the Zippy backend, response normalization, and
partial-failure handling.

### Tasks

- [ ] Create `CourierClient` interface (from ARCHITECTURE.md)
- [ ] Create `NormalizedShippingOption` DTO
- [ ] Implement `FastShipClient` — request mapping, HTTP call, response normalization
- [ ] Implement `QuickExpressClient` — same
- [ ] Implement `ReliableCourierClient` — same (handles multiple options)
- [ ] Configure `WebClient` beans with connect/read timeouts
- [ ] Implement `RateAggregationService` — parallel calls, exception handling, result collection
- [ ] Create `ShippingQuote` entity + `ShippingQuoteRepository`
- [ ] Persist normalized quotes to DB
- [ ] Implement rate controller endpoints: `POST` and `GET` `/api/orders/{id}/rates`
- [ ] Write adapter tests: 5 tests each for all 3 clients (15 total)
- [ ] Write aggregation tests: 7 tests from TESTING_STRATEGY.md

### Files Touched

```
zippy-backend/src/main/java/com/zippy/backend/
├── adapter/CourierClient.java
├── adapter/fastship/FastShipClient.java, dto/*
├── adapter/quickexpress/QuickExpressClient.java, dto/*
├── adapter/reliable/ReliableCourierClient.java, dto/*
├── dto/NormalizedShippingOption.java, RateResponse.java
├── model/ShippingQuote.java
├── repository/ShippingQuoteRepository.java
├── service/RateAggregationService.java
├── controller/RateController.java
└── config/WebClientConfig.java
zippy-backend/src/test/...
```

### Done When
- `POST /api/orders/{id}/rates` calls all 3 mock couriers in parallel
- Response contains normalized options from all couriers (4 options: FS×1, QE×1, RC×2)
- One courier failing → partial results + warning
- Timeout → partial results + warning
- All 22 tests pass

### Docs to Update
- `COURIER_NORMALIZATION.md` if any edge case is discovered during implementation

---

## Sprint 4: Carrier Selection + Shipment Creation

### Goal
Implement the two-step flow: select carrier → create shipment.

### Tasks

- [ ] Create `Shipment` entity + `ShipmentRepository`
- [ ] Implement `CarrierSelectionService` — validate quote, freeze amount, update order status
- [ ] Implement `ShipmentService` — call courier shipment API, store result, update statuses
- [ ] Add shipment-creation request mapping to each `CourierClient` implementation
- [ ] Add `ShipmentCreationResult` DTO
- [ ] Create controller endpoints: `POST /api/orders/{id}/select-carrier`,
      `POST /api/orders/{id}/create-shipment`
- [ ] Implement quoted-amount verification (anti-price-change)
- [ ] Write tests: `CarrierSelectionServiceTest` (5 tests), `ShipmentServiceTest` (6 tests)
- [ ] Write controller tests for both endpoints

### Files Touched

```
zippy-backend/src/main/java/com/zippy/backend/
├── model/Shipment.java
├── repository/ShipmentRepository.java
├── service/CarrierSelectionService.java, ShipmentService.java
├── dto/SelectCarrierRequest.java, ShipmentResponse.java, ShipmentCreationResult.java
├── controller/ShipmentController.java
├── adapter/*/  (add createShipment methods)
zippy-backend/src/test/...
```

### Done When
- `POST /select-carrier` freezes quote, transitions to `CARRIER_SELECTED`
- `POST /create-shipment` calls mock courier, stores tracking info, transitions to `SHIPMENT_CREATED`
- Quoted amount mismatch → 422
- Duplicate shipment → 409
- Courier failure → 502
- All 11+ tests pass

### Docs to Update
- None expected

---

## Sprint 5: Webhooks — Ingestion, Normalization, Idempotency

### Goal
Implement all 3 webhook endpoints, status normalization, state-machine validation,
idempotency, and status history.

### Tasks

- [ ] Create `ShipmentEvent` entity + `ShipmentEventRepository`
- [ ] Implement `WebhookProcessingService` — parse, normalize, validate transition, persist
- [ ] Implement status state-machine validation (COURIER_NORMALIZATION.md)
- [ ] Add `parseWebhookEvent()` to each `CourierClient` implementation
- [ ] Create webhook DTOs for all 3 courier formats
- [ ] Create `WebhookController` — 3 POST endpoints
- [ ] Implement idempotency via DB unique constraint + `DataIntegrityViolationException` handling
- [ ] Implement unknown-tracking-number handling (log + 200)
- [ ] Implement invalid-transition handling (log + 200)
- [ ] Add `GET /api/orders/{id}/tracking` endpoint
- [ ] Write tests: `WebhookProcessingServiceTest` (7 tests), `WebhookControllerTest` (4 tests)

### Files Touched

```
zippy-backend/src/main/java/com/zippy/backend/
├── model/ShipmentEvent.java
├── repository/ShipmentEventRepository.java
├── service/WebhookProcessingService.java
├── dto/webhook/FastShipWebhookPayload.java, QuickExpressWebhookPayload.java,
│               ReliableCourierWebhookPayload.java
├── controller/WebhookController.java, TrackingController.java
├── adapter/*/ (add parseWebhookEvent methods)
└── exception/InvalidStatusTransitionException.java
zippy-backend/src/test/...
```

### Done When
- All 3 webhook endpoints accept courier payloads and create events
- Duplicate events are silently ignored (200 returned)
- Unknown tracking numbers are logged and ignored (200 returned)
- Invalid transitions are rejected and logged (200 returned)
- `GET /tracking` returns current status + event history
- All 11 tests pass

### Docs to Update
- `EDGE_CASES_AND_FAILURE_HANDLING.md` if implementation differs from plan

---

## Sprint 6: React Frontend

### Goal
Build the 3 frontend screens: Create Order, Courier Selection, Order Details & Tracking.

### Tasks

- [ ] Set up React Router for 3 screens
- [ ] Create API client module (axios/fetch wrapper)
- [ ] Build Create Order screen — form with all fields, validation, submit
- [ ] Build Courier Selection screen — rate table, sorting (price/speed/carrier), select button
- [ ] Build Order Details & Tracking screen — order info, carrier details, status history
- [ ] Implement polling for status updates (every 5 seconds on tracking screen)
- [ ] Add loading states, error handling, and empty states
- [ ] Style with CSS (clean, functional — not a design showcase)
- [ ] Add navigation flow: Create → Rates → Select → Track

### Files Touched

```
zippy-frontend/src/
├── App.jsx
├── api/client.js
├── pages/
│   ├── CreateOrder.jsx
│   ├── CourierSelection.jsx
│   └── OrderTracking.jsx
├── components/
│   ├── OrderForm.jsx
│   ├── RateTable.jsx
│   ├── StatusTimeline.jsx
│   └── common/ (Loading, ErrorBanner, etc.)
└── styles/
```

### Done When
- Create Order form submits and navigates to rate selection
- Rate table shows all options, sortable by price/speed/carrier
- Selecting a carrier + creating shipment works end-to-end
- Tracking screen shows current status + history, auto-refreshes
- Full flow works: Create → Quote → Select → Ship → Track

### Docs to Update
- None expected

---

## Sprint 7: Test Suite Completion

### Goal
Ensure all tests from TESTING_STRATEGY.md pass. Add any missing tests identified during
implementation.

### Tasks

- [ ] Audit all test classes against TESTING_STRATEGY.md checklist
- [ ] Add any missing unit tests
- [ ] Add integration test: full order flow (create → rate → select → ship → webhook → track)
- [ ] Add integration test: concurrent webhook handling
- [ ] Ensure all test fixtures are complete and accurate
- [ ] Run full test suite — all tests green
- [ ] Generate coverage report

### Files Touched

```
zippy-backend/src/test/...  (all test files)
zippy-backend/src/test/resources/fixtures/  (test data)
```

### Done When
- All tests from TESTING_STRATEGY.md exist and pass
- `./gradlew test` is all-green
- Coverage ≥ 90% for service and adapter layers

### Docs to Update
- `TESTING_STRATEGY.md` — add any tests discovered during implementation

---

## Sprint 8: README, Postman Collection, Polish

### Goal
Produce all non-code deliverables. Polish the project for submission.

### Tasks

- [ ] Write `README.md` — project overview, architecture summary, tech stack, setup instructions
      (local + Docker), API overview, sample data, how to trigger status events
- [ ] Create Postman collection with all Zippy API + webhook endpoints, pre-populated sample data
- [ ] Create `sample-data.json` or seed script with sample orders, quotes, shipments
- [ ] Write architecture section in README (or link to ARCHITECTURE.md)
- [ ] Add instructions for triggering courier status events (mock UI or API calls)
- [ ] Final review of all docs — fix any drift between plan and implementation
- [ ] Verify Docker Compose `up` runs the complete system from scratch
- [ ] Verify README instructions work on a clean checkout

### Files Touched

```
README.md
postman/zippy-logistics.postman_collection.json
sample-data/sample-orders.json
docker-compose.yml (final tweaks)
docs/ (any corrections)
```

### Done When
- A new developer can clone the repo, follow README instructions, and have the full system
  running in < 5 minutes
- Postman collection exercises the full flow
- All deliverables from the spec are present

### Docs to Update
- `CLAUDE.md` — final update with accurate run commands
- All docs reviewed for accuracy
