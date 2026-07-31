# ShipFlow — Logistics Aggregation Platform

A full-stack logistics platform that aggregates multiple courier partners, compares shipping rates, and manages the end-to-end shipment lifecycle with real-time tracking and webhook-driven status updates.

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   React SPA  │────▶│  Spring Boot API  │────▶│  Mock Courier APIs  │
│   (Vercel)   │     │   (Port 8080)     │     │   (Port 8081)       │
└──────────────┘     └────────┬─────────┘     └──────────┬──────────┘
                              │                          │
                              ▼                          │
                     ┌──────────────────┐                │
                     │   PostgreSQL 16  │                │
                     │   (Port 5432)    │    Webhooks ◀──┘
                     └──────────────────┘
```

## ✨ Key Features

### Order Management
- Create shipment orders with pickup/delivery addresses, package dimensions, and weight
- Support for both **COD** and **Prepaid** payment modes
- Full order lifecycle tracking (Created → Carrier Selected → Shipped → Delivered)

### Rate Aggregation Engine
- Aggregates rates from **3 courier partners** (FastShip, QuickExpress, ReliableCourier)
- **Dynamic pricing** based on package weight, dimensions, and COD status
- Realistic freight breakdown: Base Freight + COD Handling Fee + Fuel Surcharge + 18% GST
- Sort and compare rates by price, delivery time, or carrier

### Shipment Booking & AWB Generation
- Full-page booking confirmation with transparent cost breakdown
- Clear separation of Product Value (COD collection) vs Courier Freight charges
- AWB (Air Waybill) generation on booking confirmation

### Real-Time Tracking
- Webhook-driven status updates from courier partners
- Visual shipment timeline with step-by-step tracking
- Public tracking page for end customers (no login required)

### Payments & Settlements
- Auto-generated payment records linked 1:1 with orders
- Tracks payment status, settlement status, and COD remittance
- Financial analytics on the merchant dashboard

### Analytics Dashboard
- KPI cards: Total Shipments, Active Transit, Pending Settlements, Freight Spend
- **Shipment Funnel** (Donut Chart) — visual order status distribution
- **Revenue vs Freight Cost** (Bar Chart) — financial margin analysis
- Built with Recharts for responsive, interactive visualizations

### Admin Panel
- Webhook Studio for simulating courier webhook events
- Order management and system-wide analytics
- Settings and configuration management

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Recharts, Lucide Icons |
| Backend | Java 21, Spring Boot 3.3, Spring Data JPA |
| Database | PostgreSQL 16 with Flyway migrations |
| Mock Services | Spring Boot microservice simulating 3 courier APIs |
| Containerization | Docker, Docker Compose |
| Deployment | Vercel (Frontend), AWS EC2 (Backend) |

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local frontend development)
- Java 21+ (for local backend development)

### Run with Docker Compose
```bash
# Clone the repository
git clone https://github.com/Rakshan0004/ShipFlow_A_Logistics_Platform.git
cd ShipFlow_A_Logistics_Platform

# Start all services
docker compose up --build -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# Mock Courier Service: http://localhost:8081
```

### Run Frontend Locally
```bash
cd zippy-frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 📁 Project Structure

```
├── zippy-frontend/          # React SPA
│   ├── src/
│   │   ├── api/             # Axios API client & endpoints
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React Context (Toast, Theme)
│   │   ├── pages/           # Route-level page components
│   │   └── utils/           # Formatters, constants
│   └── vercel.json          # Vercel SPA routing config
│
├── zippy-backend/           # Spring Boot API
│   ├── src/main/java/
│   │   ├── controller/      # REST controllers
│   │   ├── service/         # Business logic
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Spring Data repositories
│   │   └── dto/             # Request/Response DTOs
│   └── src/main/resources/
│       └── db/migration/    # Flyway SQL migrations
│
├── mock-courier-service/    # Simulated courier partner APIs
│   ├── fastship/            # FastShip courier (Air Express)
│   ├── quickexpress/        # QuickExpress courier
│   └── reliable/            # ReliableCourier (Surface + Air)
│
└── docker-compose.yml       # Multi-service orchestration
```

## 🔌 API Endpoints

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/{id}` | Get order details |
| GET | `/api/orders/{id}/amount` | Get COD amount for an order |

### Rate Aggregation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rates/{orderId}/fetch` | Fetch & compare courier rates |
| POST | `/api/rates/{orderId}/select` | Select a courier and book shipment |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List all payments |
| GET | `/api/payments/{orderId}` | Get payment for a specific order |

### Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tracking/{trackingNumber}` | Get tracking details |
| POST | `/api/webhooks/{carrier}` | Receive courier webhook events |

## 📊 Dynamic Pricing Engine

The mock courier service calculates rates based on actual shipment parameters:

| Courier | Base Rate | COD Fee | Fuel | Tax |
|---------|----------|---------|------|-----|
| FastShip Air | ₹80/kg | 2% of invoice | 10% of base | 18% GST |
| QuickExpress | ₹110/kg | Flat ₹50 | Flat ₹12 | 18% GST |
| Reliable Surface | ₹75/kg | Flat ₹30 | Flat ₹10 | 18% GST |
| Reliable Air | ₹125/kg | Flat ₹40 | Flat ₹15 | 18% GST |

## 📝 License

This project is built as a technical assignment for demonstration purposes.
