# ⚡ Zippy Logistics Platform — Multi-Courier Logistics Aggregator

Zippy is an enterprise-grade multi-courier logistics aggregator platform designed to streamline shipping rate aggregation, carrier selection, shipment booking, and real-time tracking webhook processing across 3 distinct courier APIs (**FastShip**, **QuickExpress**, and **ReliableCourier**).

---

## 🚀 Key Features

1. **Order Domain Management**:
   - Order creation with pincode validation (6-digit Indian postal codes), COD rules, weight validation, and Zippy order ID generation (`ZPY-ORD-10001`).

2. **Parallel Rate Aggregation & Normalization**:
   - Asynchronous parallel querying of mock courier APIs using Spring `WebClient` with a 5-second hard timeout.
   - Partial failure tolerance: if a courier API fails (HTTP 500) or times out, Zippy returns available quotes alongside structured warning alerts.
   - Multi-criteria sorting (`price`, `speed`, `carrier`).

3. **Guaranteed Carrier Selection & Price Freezing**:
   - Two-step transaction flow: Merchant selects carrier → Zippy verifies quoted amount against database quote (`PriceMismatchException` if price tampered) → freezes rate → creates shipment with courier.

4. **Real-Time Webhook Processing & 7-Row Status Normalization**:
   - Ingests webhooks from all 3 couriers and normalizes status codes into 7 common Zippy statuses:
     `SHIPMENT_CREATED` ➔ `PICKED_UP` ➔ `IN_TRANSIT` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED` / `DELIVERY_FAILED` / `RTO`.
   - **Idempotent Ingestion**: PostgreSQL partial unique constraint `(shipment_id, carrier_event_id)` catches duplicates silently (HTTP 200 OK).
   - **Unknown Shipment Handling**: Unregistered tracking webhooks return HTTP 200 OK (`UNKNOWN_SHIPMENT`) without creating orphan database records.
   - **State Machine Guardrails**: Rejects illegal status regressions (e.g. `DELIVERED` ➔ `IN_TRANSIT`) with HTTP 200 OK (`REJECTED_INVALID_TRANSITION`).

5. **Merchant Dashboard Single-Page Application (SPA)**:
   - Built with React 18 & Vite, featuring a glassmorphism dark UI, sample order auto-fill (`⚡ Auto-Fill Sample Data`), live rate comparison table, frozen quote card, and real-time visual tracking timeline stepper.

---

## 🛠 Technology Stack

- **Backend Framework**: Java 21, Spring Boot 3.3.0
- **Asynchronous HTTP Client**: Spring WebFlux `WebClient` (Netty engine)
- **Database & Persistence**: PostgreSQL, Spring Data JPA, Flyway Versioned Migrations (V1–V4)
- **Frontend Framework**: React 18, Vite 5, Vanilla CSS Design System
- **Build System**: Gradle 8.7 (Multi-Module Kotlin DSL)
- **Containerization & Orchestration**: Docker, Docker Compose

---

## 📐 High-Level System Architecture

```
                                  ┌───────────────────────────┐
                                  │   Merchant Dashboard      │
                                  │   React 18 / Vite (SPA)   │
                                  └─────────────┬─────────────┘
                                                │ REST API
                                                ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                Zippy Backend Service (Port 8080)                       │
│                                                                                        │
│  ┌──────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐  │
│  │ Order Controller │    │ Rate Aggregation Service │    │ Webhook Processing Engine│  │
│  └────────┬─────────┘    └────────────┬─────────────┘    └────────────┬─────────────┘  │
│           │                           │ (Parallel Calls)              │                │
└───────────┼───────────────────────────┼───────────────────────────────┼────────────────┘
            │                           │                               │ Webhooks
            ▼                           ▼                               ▲
┌────────────────────────┐  ┌───────────────────────────────────────────┼────────────────┐
│   PostgreSQL Database   │  │              Mock Courier Service (Port 8081)             │
│  - orders              │  │                                                            │
│  - shipping_quotes     │  │  - FastShip API (/fastship/api/v1/rate)                    │
│  - shipments           │  │  - QuickExpress API (/quickexpress/rates/check)            │
│  - shipment_events     │  │  - ReliableCourier API (/reliablecourier/shipping-options) │
└────────────────────────┘  └────────────────────────────────────────────────────────────┘
```

---

## 📊 Courier API Normalization Mapping

| Normalized Zippy Status | FastShip `event_code` | QuickExpress `event.type` | ReliableCourier `statusId` |
|---|---|---|---|
| `SHIPMENT_CREATED` | `BOOKED` | `SC` | `10` |
| `PICKED_UP` | `PICKED_UP` | `PU` | `20` |
| `IN_TRANSIT` | `IN_TRANSIT` | `IT` | `30` |
| `OUT_FOR_DELIVERY` | `OUT_FOR_DELIVERY` | `OFD` | `40` |
| `DELIVERED` | `DELIVERED` | `DLV` | `50` |
| `DELIVERY_FAILED` | `DELIVERY_FAILED` | `NDR` | `60` |
| `RTO` | `RETURNED` | `RTO` | `70` |

---

## 💻 Quick Start & Running Locally

### 🐳 Option 1: Running via Docker Compose (Recommended)

**The fastest way to run the complete platform:**

```bash
# Windows
docker-start.bat

# Or use docker-compose directly
docker-compose up --build
```

**Wait 1-2 minutes for all services to start, then access:**
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Mock Courier Service**: http://localhost:8081
- **Database**: localhost:5432 (user: zippy, password: zippy, db: zippydb)

**Stop all services:**
```bash
# Windows
docker-stop.bat

# Or use docker-compose directly
docker-compose down
```

📖 **Detailed Docker Guide**: See [DOCKER_SETUP.md](DOCKER_SETUP.md) for comprehensive configuration, troubleshooting, and production considerations.

📖 **Quick Reference**: See [QUICK_START.md](QUICK_START.md) for feature testing and common tasks.

---

### 🔧 Option 2: Running Locally Without Docker (Development)

For active development with hot-reload:

1. **Start Local PostgreSQL Database**:
   Ensure PostgreSQL is running locally on port `5432` with database `zippy_db`, user `zippy_user`, and password `zippy_password`.

2. **Run Backend Services via Gradle**:
   ```bash
   # Windows PowerShell / CMD
   .\run-local.bat

   # Linux / macOS
   ./run-local.sh
   ```

3. **Run React Frontend**:
   ```bash
   cd zippy-frontend
   npm install
   npm run dev
   ```

---

## 🧪 Automated Test Verification

Run the full automated test suite (unit, integration, and controller tests across all modules):

```bash
.\gradlew test
```

Expected Output:
```
BUILD SUCCESSFUL in 29s
8 actionable tasks: 5 executed, 3 up-to-date
```
- **41/41 tests passed** (0 failures, 0 errors).

---

## 📬 Postman Collection

A complete Postman collection is included under [`postman/zippy-logistics.postman_collection.json`](file:///c:/Projects/Logistics%20Platform/postman/zippy-logistics.postman_collection.json) covering:
1. `Create Order` (`POST /api/orders`)
2. `Fetch Parallel Rates` (`POST /api/orders/{id}/rates?sort=price`)
3. `Select Carrier` (`POST /api/orders/{id}/select-carrier`)
4. `Create Shipment` (`POST /api/orders/{id}/create-shipment`)
5. `Order Tracking` (`GET /api/orders/{id}/tracking`)
6. `Webhooks` (FastShip, QuickExpress, ReliableCourier)
7. `Mock Status Trigger` (`POST /mock/shipments/fastship/advance`)

---

## ⚙️ Simulation & Webhook Controls

To test status advancement and webhooks live in your browser:
1. Create an order and book a shipment in the Merchant Dashboard (`http://localhost:3000`).
2. Go to the **⚙ Simulation & Webhooks** tab.
3. Click **⏩ Advance to Next Status** — the mock courier will send a live webhook to the Zippy Backend, updating the visual tracking timeline in real time!
