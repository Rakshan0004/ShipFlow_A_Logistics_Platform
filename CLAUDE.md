# CLAUDE.md — Zippy Logistics Platform

**Read this file at the start of every session.** It contains the project conventions,
key decisions, and pointers to all planning documents.

---

## Project Overview

Zippy is a logistics aggregation platform (take-home coding assignment). It connects a
merchant frontend with 3 mock courier services (FastShip, QuickExpress, ReliableCourier)
through a Spring Boot backend that normalizes their different API formats.

**This is not a production system.** Focus on: clean architecture, correct domain modeling,
test coverage, and clear documentation.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Java 21, Spring Boot 3.x, Gradle (Kotlin DSL) |
| Frontend | React (Vite) |
| Database | PostgreSQL (via Docker Compose) |
| HTTP Client | Spring WebClient |
| Migrations | Flyway |
| Testing | JUnit 5, Mockito, AssertJ, Spring Boot Test |
| Build | Gradle multi-module (`zippy-backend`, `mock-courier-service`) |

---

## How to Run Locally

### Local Development
```bash
# Start PostgreSQL
docker compose up postgres -d

# Backend (port 8080)
./gradlew :zippy-backend:bootRun

# Mock Courier Service (port 8081)
./gradlew :mock-courier-service:bootRun

# Frontend (port 3000)
cd zippy-frontend && npm run dev
```

### With Docker
```bash
docker compose up --build
```

### Run Tests
```bash
./gradlew test                          # All tests
./gradlew :zippy-backend:test           # Backend only
./gradlew :zippy-backend:test --tests "com.zippy.backend.service.*"  # Specific package
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build tool | Gradle (Kotlin DSL) | Multi-module, fast incremental builds |
| Mock courier structure | One app, isolated packages | Simpler setup, clear separation via packages |
| Select carrier + create shipment | Two separate APIs | Explicit confirmation, cleaner retry |
| Invalid status transition | Reject (log + 200 to courier) | Data integrity over silent acceptance |
| Database | **PostgreSQL** (Docker Compose) | Single database for all environments — no dual-profile maintenance |
| Migration tool | Flyway | Simple SQL scripts, native Spring Boot support |

---

## Coding Conventions

### Package Structure
```
com.zippy.backend.{layer}/        # controller, service, adapter, repository, model, dto, mapper, exception
com.zippy.mockcourier.{courier}/  # fastship, quickexpress, reliable
```

### Naming
- Entities: singular nouns (`Order`, `Shipment`)
- Tables: plural snake_case (`orders`, `shipment_events`)
- DTOs: `{Action}{Entity}Request`, `{Entity}Response`
- Services: `{Domain}Service`
- Adapters: `{CourierName}Client implements CourierClient`

### Entity / DTO Separation
- Entities are JPA-annotated, never exposed in API responses
- DTOs are plain POJOs with validation annotations (request DTOs only)
- Mappers use static methods (no MapStruct — keep it simple)
- Monetary amounts use `BigDecimal`

### Key Patterns
- **Courier Adapter** — all couriers implement `CourierClient` interface
- **Strategy via DI** — `List<CourierClient>` auto-collected by Spring
- **Webhook idempotency** — DB unique constraint on `(shipment_id, carrier_event_id)`
- **Status state machine** — validated before persisting status events

---

## Definition of Done (for any task)

- [ ] Code compiles and passes all existing tests
- [ ] New code has unit tests (service/adapter) or controller tests (`@WebMvcTest`)
- [ ] Test fixtures used for test data (not hardcoded strings in tests)
- [ ] Relevant docs updated if implementation deviates from plan
- [ ] No `// TODO` left without a corresponding issue/task

---

## Planning Documents

| Document | Path | Purpose |
|----------|------|---------|
| Requirements | [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Full spec restatement, open questions |
| Architecture | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Component diagram, layering, design decisions |
| Data Model | [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) | ERD, migrations, indexing |
| API Contracts | [`docs/API_CONTRACTS.md`](docs/API_CONTRACTS.md) | All endpoints, request/response shapes |
| Normalization | [`docs/COURIER_NORMALIZATION.md`](docs/COURIER_NORMALIZATION.md) | Field mappings, status state machine |
| Edge Cases | [`docs/EDGE_CASES_AND_FAILURE_HANDLING.md`](docs/EDGE_CASES_AND_FAILURE_HANDLING.md) | Failure scenarios → mechanisms |
| Testing | [`docs/TESTING_STRATEGY.md`](docs/TESTING_STRATEGY.md) | Test items → test classes |
| Sprint Plan | [`docs/SPRINT_PLAN.md`](docs/SPRINT_PLAN.md) | Sprint 0–8 with acceptance criteria |

## Skill Playbooks

Re-read the relevant playbook before repeating a pattern:

| Skill | Path | When to Use |
|-------|------|-------------|
| Courier Adapter | [`docs/skills/courier-adapter.md`](docs/skills/courier-adapter.md) | Adding/modifying a courier integration |
| Webhook Handler | [`docs/skills/webhook-handler.md`](docs/skills/webhook-handler.md) | Adding/modifying a webhook endpoint |
| Spring Boot Module | [`docs/skills/spring-boot-module.md`](docs/skills/spring-boot-module.md) | Creating new entities, services, controllers |
| React Screen | [`docs/skills/react-screen.md`](docs/skills/react-screen.md) | Building frontend pages and components |

---

## Quick Reference: Status Enums

### Order Status
```
ORDER_CREATED → CARRIER_SELECTED → SHIPMENT_CREATED
```

### Shipment Status
```
SHIPMENT_CREATED → PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
                                           → DELIVERY_FAILED → RTO
                                                              → OUT_FOR_DELIVERY (re-attempt)
```

---

## Quick Reference: Courier Carrier Codes

| Code | Name | Rate API | Shipment API |
|------|------|----------|-------------|
| `FASTSHIP` | FastShip | `POST /fastship/api/v1/rate` | `POST /fastship/api/v1/shipments` |
| `QUICKEXPRESS` | QuickExpress | `POST /quickexpress/rates/check` | `POST /quickexpress/booking/create` |
| `RELIABLE` | ReliableCourier | `GET /reliablecourier/shipping-options` | `PUT /reliablecourier/orders` |
