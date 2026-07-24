# Docker Setup Guide for Zippy Logistics Platform

## Overview

This guide will help you run the complete Zippy Logistics Platform using Docker Compose. The platform consists of four main services:

1. **PostgreSQL Database** - Data persistence
2. **Mock Courier Service** - Simulates FastShip, QuickExpress, and ReliableCourier APIs
3. **Zippy Backend** - Spring Boot REST API
4. **Zippy Frontend** - React application with Nginx

## Prerequisites

- Docker Desktop installed and running
- Docker Compose v3.8 or higher
- At least 4GB of available RAM
- Ports 3000, 8080, 8081, and 5432 available

## Quick Start

### 1. Build and Start All Services

```bash
docker-compose up --build
```

This command will:
- Build Docker images for all services
- Start containers in the correct order
- Wait for health checks to pass before starting dependent services

### 2. Access the Application

Once all services are healthy (this may take 1-2 minutes):

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8080/api
- **Mock Courier Service**: http://localhost:8081
- **PostgreSQL**: localhost:5432

### 3. Stop All Services

```bash
docker-compose down
```

To also remove volumes (database data):
```bash
docker-compose down -v
```

## Service Details

### PostgreSQL Database
- **Port**: 5432
- **Database**: zippydb
- **Username**: zippy
- **Password**: zippy
- **Data Volume**: postgres_data

### Mock Courier Service
- **Port**: 8081
- **Endpoints**:
  - FastShip: `/fastship/rate`, `/fastship/book`
  - QuickExpress: `/quickexpress/rate`, `/quickexpress/book`
  - ReliableCourier: `/reliable/rate`, `/reliable/book`
  - Status Trigger: `/mock/trigger-status/{trackingNumber}/{status}`

### Zippy Backend
- **Port**: 8080
- **Profile**: docker
- **API Base**: `/api`
- **Health Check**: `/actuator/health`
- **Endpoints**:
  - Dashboard: `/api/dashboard`
  - Shipments: `/api/shipments`
  - Rates: `/api/rates`
  - Webhooks: `/api/webhooks`

### Zippy Frontend
- **Port**: 3000
- **Framework**: React + Vite
- **Web Server**: Nginx
- **Health Check**: `/health`
- **API Proxy**: Requests to `/api/*` are proxied to backend

## Development Commands

### View Logs

All services:
```bash
docker-compose logs -f
```

Specific service:
```bash
docker-compose logs -f zippy-backend
docker-compose logs -f zippy-frontend
docker-compose logs -f mock-courier-service
docker-compose logs -f postgres
```

### Restart a Service

```bash
docker-compose restart zippy-backend
```

### Rebuild a Single Service

```bash
docker-compose up --build -d zippy-frontend
```

### Check Service Health

```bash
docker-compose ps
```

### Execute Commands in Container

```bash
docker-compose exec zippy-backend sh
docker-compose exec postgres psql -U zippy -d zippydb
```

## Networking

All services communicate through the `zippy-network` bridge network:

- Services reference each other by container name
- Frontend proxies API calls to `zippy-backend:8080`
- Backend calls mock couriers at `mock-courier-service:8081`
- Backend connects to database at `postgres:5432`

## Health Checks

All services have health checks configured:

- **Postgres**: Ready check every 5s
- **Mock Courier**: HTTP check every 10s (30s startup grace)
- **Backend**: HTTP check every 10s (60s startup grace)
- **Frontend**: HTTP check every 10s

Services will only start once their dependencies are healthy.

## Troubleshooting

### Services Won't Start

1. Check if ports are already in use:
   ```bash
   netstat -ano | findstr "3000 8080 8081 5432"
   ```

2. Check Docker resources (Settings → Resources)
   - Recommended: 4GB RAM, 2 CPUs

### Database Connection Issues

1. Ensure postgres is healthy:
   ```bash
   docker-compose ps postgres
   ```

2. Check backend logs:
   ```bash
   docker-compose logs zippy-backend
   ```

### Frontend Can't Connect to Backend

1. Verify backend is healthy:
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. Check nginx proxy configuration in the frontend container

### Build Failures

1. Clean everything and rebuild:
   ```bash
   docker-compose down -v
   docker system prune -a
   docker-compose build --no-cache
   docker-compose up
   ```

### Slow Performance

1. Increase Docker Desktop memory allocation
2. Use build cache: Remove `--build` flag after first build
3. Check container resource usage:
   ```bash
   docker stats
   ```

## Production Considerations

This setup is configured for **development/testing**. For production:

1. **Security**:
   - Use secrets management (not environment variables)
   - Change default passwords
   - Enable HTTPS with proper certificates
   - Add rate limiting and authentication

2. **Scalability**:
   - Use external database (not containerized)
   - Add load balancer for backend replicas
   - Configure proper resource limits
   - Use production-grade reverse proxy

3. **Monitoring**:
   - Add logging aggregation (ELK, Splunk)
   - Implement metrics collection (Prometheus)
   - Set up alerting and monitoring dashboards

4. **Data Persistence**:
   - Use external volume mounts for database
   - Implement backup strategies
   - Configure replication for high availability

## Environment Variables

### Backend (application-docker.yml)
- `SPRING_PROFILES_ACTIVE=docker`
- Database connection points to `postgres:5432`
- Courier URLs point to `mock-courier-service:8081`

### Mock Courier
- `ZIPPY_BACKEND_HOST=zippy-backend`
- `SERVER_PORT=8081`

### Frontend
- `NODE_ENV=production`
- API proxy configured in nginx.conf

## Clean Up

Remove all containers, networks, and images:
```bash
docker-compose down -v --rmi all
```

Remove unused Docker resources:
```bash
docker system prune -a --volumes
```

## Next Steps

After services are running:

1. Open http://localhost:3000
2. Test the Dashboard features
3. Create test shipments
4. Verify courier integrations
5. Trigger webhook events using the mock service

For API documentation, see `/docs/API_CONTRACTS.md`
