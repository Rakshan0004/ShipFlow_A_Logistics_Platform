# Zippy Logistics Platform - Quick Start Guide

## 🚀 Running the Complete Application

### Option 1: Using Docker (Recommended for Testing)

The easiest way to run the entire platform:

1. **Start Docker Desktop**
   - Ensure Docker Desktop is running on your machine

2. **Run the Platform**
   ```bash
   # Windows
   docker-start.bat
   
   # Or use docker-compose directly
   docker-compose up --build
   ```

3. **Wait for Services** (1-2 minutes on first run)
   - Database initializes
   - Backend starts and runs migrations
   - Mock courier service starts
   - Frontend builds and serves

4. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080/api
   - **Mock Couriers**: http://localhost:8081

5. **Stop the Platform**
   ```bash
   # Windows
   docker-stop.bat
   
   # Or use docker-compose directly
   docker-compose down
   ```

### Option 2: Running Locally (Development)

For active development with hot-reload:

1. **Start PostgreSQL**
   ```bash
   docker-compose up -d postgres
   ```

2. **Start Mock Courier Service**
   ```bash
   cd mock-courier-service
   ../gradlew bootRun
   ```

3. **Start Backend**
   ```bash
   cd zippy-backend
   ../gradlew bootRun
   ```

4. **Start Frontend**
   ```bash
   cd zippy-frontend
   npm install
   npm run dev
   ```

## 📊 Testing the Application

### 1. View Dashboard
- Navigate to http://localhost:3000
- The dashboard shows:
  - Total shipments by status
  - Active shipments chart
  - Recent shipments list

### 2. Create a Shipment

**Via UI:**
- Click "New Shipment" button
- Fill in shipment details
- Select a courier
- Submit

**Via API:**
```bash
curl -X POST http://localhost:8080/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "New York, NY",
    "destination": "Los Angeles, CA",
    "weight": 5.5,
    "dimensions": "10x10x10",
    "courierName": "FastShip"
  }'
```

### 3. Get Shipping Rates

**Via API:**
```bash
curl -X POST http://localhost:8080/api/rates \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "New York, NY",
    "destination": "Los Angeles, CA",
    "weight": 5.5,
    "dimensions": "10x10x10"
  }'
```

### 4. Trigger Status Updates (Mock Service)

```bash
curl -X POST http://localhost:8081/mock/trigger-status/TRACK123/IN_TRANSIT
```

Available statuses: `PENDING`, `IN_TRANSIT`, `DELIVERED`, `FAILED`

## 🔍 Monitoring and Debugging

### Check Service Health

```bash
# Backend
curl http://localhost:8080/actuator/health

# Mock Courier
curl http://localhost:8081/actuator/health

# Frontend
curl http://localhost:3000/health
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f zippy-backend
docker-compose logs -f zippy-frontend
docker-compose logs -f mock-courier-service
```

### Database Access

```bash
docker-compose exec postgres psql -U zippy -d zippydb

# List tables
\dt

# View shipments
SELECT * FROM shipments;

# View audit logs
SELECT * FROM audit_log;
```

## 📁 Project Structure

```
Logistics Platform/
├── zippy-frontend/          # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utilities
│   ├── Dockerfile
│   └── nginx.conf           # Production nginx config
│
├── zippy-backend/           # Spring Boot backend
│   ├── src/main/java/com/zippy/
│   │   ├── controller/      # REST controllers
│   │   ├── service/         # Business logic
│   │   ├── repository/      # Data access
│   │   ├── model/           # Domain entities
│   │   └── courier/         # Courier adapters
│   ├── src/main/resources/
│   │   ├── db/migration/    # Flyway migrations
│   │   ├── application.yml  # Local config
│   │   └── application-docker.yml  # Docker config
│   └── Dockerfile
│
├── mock-courier-service/    # Mock courier APIs
│   ├── src/main/java/com/zippy/mockcourier/
│   │   ├── fastship/        # FastShip mock
│   │   ├── quickexpress/    # QuickExpress mock
│   │   └── reliable/        # ReliableCourier mock
│   └── Dockerfile
│
├── docs/                    # Documentation
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACTS.md
│   └── DATA_MODEL.md
│
├── docker-compose.yml       # Service orchestration
├── DOCKER_SETUP.md         # Detailed Docker guide
└── QUICK_START.md          # This file
```

## 🎯 Available Features

### Dashboard
- ✅ Total shipments by status visualization
- ✅ Active shipments trend chart
- ✅ Recent shipments list
- ✅ Real-time metrics

### Shipment Management
- ✅ Create shipments
- ✅ View shipment details
- ✅ Track shipment status
- ✅ Search and filter

### Rate Shopping
- ✅ Get quotes from multiple couriers
- ✅ Compare rates and transit times
- ✅ Select best option

### Courier Integration
- ✅ FastShip adapter
- ✅ QuickExpress adapter
- ✅ ReliableCourier adapter
- ✅ Webhook status updates
- ✅ Normalized data model

### Audit & Compliance
- ✅ Complete audit trail
- ✅ Event tracking
- ✅ Change history

## 🛠️ Common Tasks

### Reset Database
```bash
docker-compose down -v
docker-compose up -d postgres
# Migrations run automatically on backend start
```

### Rebuild Frontend Only
```bash
docker-compose up --build -d zippy-frontend
```

### View API Documentation
- Open `docs/API_CONTRACTS.md` for complete API reference
- Backend swagger UI (if enabled): http://localhost:8080/swagger-ui.html

### Run Tests
```bash
# Backend tests
./gradlew :zippy-backend:test

# Mock courier tests
./gradlew :mock-courier-service:test

# Frontend tests
cd zippy-frontend
npm test
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - Find process using port
netstat -ano | findstr "3000"
netstat -ano | findstr "8080"

# Kill the process or change port in docker-compose.yml
```

### Database Connection Failed
- Ensure postgres container is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`
- Verify credentials in `application-docker.yml`

### Frontend Can't Reach Backend
- Verify backend is running: `curl http://localhost:8080/actuator/health`
- Check nginx proxy config in `zippy-frontend/nginx.conf`
- Review browser console for CORS errors

### Build Failures
```bash
# Clean Docker cache
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up
```

## 📚 Additional Resources

- [Architecture Documentation](docs/ARCHITECTURE.md)
- [API Contracts](docs/API_CONTRACTS.md)
- [Data Model](docs/DATA_MODEL.md)
- [Testing Strategy](docs/TESTING_STRATEGY.md)
- [Docker Setup Details](DOCKER_SETUP.md)

## 🤝 Need Help?

1. Check the logs: `docker-compose logs -f [service-name]`
2. Verify all services are healthy: `docker-compose ps`
3. Review service health endpoints
4. Check port availability
5. Ensure Docker has sufficient resources (4GB+ RAM)

---

**Last Updated**: 2026-07-24
**Platform Version**: 1.0.0
