# Dashboard API Testing Guide

## New Dashboard Endpoints

### 1. GET /api/dashboard/stats

Returns aggregated statistics for the dashboard.

**Request:**
```bash
GET http://localhost:8080/api/dashboard/stats
```

**Response (200 OK):**
```json
{
  "totalOrders": 156,
  "activeShipments": 23,
  "deliveredToday": 12,
  "totalRevenue": 125000.00,
  "courierBreakdown": {
    "FASTSHIP": 45,
    "QUICKEXPRESS": 67,
    "RELIABLE": 44
  },
  "statusBreakdown": {
    "ORDER_CREATED": 5,
    "CARRIER_SELECTED": 3,
    "SHIPMENT_CREATED": 8,
    "IN_TRANSIT": 15,
    "OUT_FOR_DELIVERY": 7,
    "DELIVERED": 118
  }
}
```

**Response Fields:**
- `totalOrders`: Total count of all orders in the system
- `activeShipments`: Count of shipments not in terminal states (DELIVERED, RTO, DELIVERY_FAILED, CANCELLED)
- `deliveredToday`: Count of orders delivered today (based on order updated_at timestamp)
- `totalRevenue`: Sum of COD amounts for all delivered orders
- `courierBreakdown`: Count of shipments per courier carrier code
- `statusBreakdown`: Count of orders per order status

**Business Logic:**
- Active shipments exclude: DELIVERED, RTO, DELIVERY_FAILED, CANCELLED
- Delivered today uses system default timezone
- Total revenue only includes delivered orders with COD amounts (nulls treated as 0)

---

### 2. GET /api/dashboard/recent-orders

Returns the most recent orders for the dashboard.

**Request:**
```bash
GET http://localhost:8080/api/dashboard/recent-orders?limit=10
```

**Query Parameters:**
- `limit` (optional): Number of orders to return (default: 10, max: 50)

**Response (200 OK):**
```json
{
  "orders": [
    {
      "orderId": "ZPY-ORD-10156",
      "merchantOrderId": "MERCHANT-10156",
      "customerName": "Priya Verma",
      "orderStatus": "IN_TRANSIT",
      "createdAt": "2026-07-24T14:30:00Z",
      "deliveryCity": "Mumbai"
    },
    {
      "orderId": "ZPY-ORD-10155",
      "merchantOrderId": "MERCHANT-10155",
      "customerName": "Rahul Sharma",
      "orderStatus": "DELIVERED",
      "createdAt": "2026-07-24T12:15:00Z",
      "deliveryCity": "Delhi"
    }
  ]
}
```

**Response Fields:**
- `orders`: Array of recent order summaries sorted by creation date (descending)
  - `orderId`: Zippy order ID
  - `merchantOrderId`: Merchant's order reference
  - `customerName`: Customer name
  - `orderStatus`: Current order status
  - `createdAt`: Order creation timestamp
  - `deliveryCity`: Delivery city

**Business Logic:**
- Orders sorted by `createdAt` in descending order (most recent first)
- Limit enforced: minimum 1, maximum 50, default 10
- If limit exceeds 50, it's automatically capped at 50

---

## Testing with curl (when services are running)

### Test Stats Endpoint:
```bash
curl -X GET http://localhost:8080/api/dashboard/stats
```

### Test Recent Orders (default limit):
```bash
curl -X GET http://localhost:8080/api/dashboard/recent-orders
```

### Test Recent Orders (custom limit):
```bash
curl -X GET "http://localhost:8080/api/dashboard/recent-orders?limit=5"
```

---

## Implementation Details

### Files Created:

**DTOs:**
- `DashboardStatsResponse.java` - Dashboard statistics response
- `RecentOrderResponse.java` - Single recent order DTO
- `RecentOrdersResponse.java` - Wrapper for recent orders list

**Service:**
- `DashboardService.java` - Business logic for dashboard data aggregation

**Controller:**
- `DashboardController.java` - REST endpoints for dashboard

**Tests:**
- `DashboardServiceTest.java` - Unit tests with Mockito

### Repository Usage:

The implementation uses existing repositories:
- `OrderRepository.findAll()` - Get all orders for statistics
- `ShipmentRepository.findAll()` - Get all shipments for active count and courier breakdown
- `OrderRepository.findAll(PageRequest)` - Get paginated recent orders

### Performance Considerations:

Current implementation loads all orders/shipments into memory for calculation. This works fine for demo/small datasets but should be optimized with database-level aggregation queries for production:

**Future optimization suggestions:**
- Add custom query methods to repositories using @Query annotations
- Use SQL aggregate functions (COUNT, SUM, GROUP BY)
- Add database indexes on frequently queried fields (orderStatus, createdAt, updatedAt)
- Consider caching dashboard stats with a TTL (e.g., 30 seconds)

---

## Testing Results

✅ Unit tests created and passing (DashboardServiceTest.java)
✅ All test scenarios covered:
  - Complete stats calculation
  - Courier breakdown aggregation
  - Status breakdown aggregation
  - Empty data handling
  - Recent orders with default limit
  - Recent orders with custom limit
  - Recent orders with max limit enforcement
  - Correct field mapping in DTOs

✅ Integration testing pending:
  - Requires PostgreSQL database running
  - Requires backend application running
  - Can be tested with docker-compose up

---

## Next Steps for Integration Testing

1. Start Docker services:
   ```bash
   docker-compose up -d
   ```

2. Wait for services to be ready

3. Start backend:
   ```bash
   ./gradlew :zippy-backend:bootRun
   ```

4. Test endpoints:
   ```bash
   curl http://localhost:8080/api/dashboard/stats
   curl http://localhost:8080/api/dashboard/recent-orders?limit=5
   ```

5. Expected behavior:
   - Stats endpoint returns aggregated data based on current database state
   - Recent orders endpoint returns ordered list by creation date
   - Both endpoints return JSON with correct structure
