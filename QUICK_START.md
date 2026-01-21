# Telemetry Vault - Quick Start

## Prerequisites

- Node.js 18+ and Yarn
- Docker and Docker Compose

## Quick Start (Docker)

```bash
# Navigate to project
cd telemetry-vault

# Start services
docker-compose up --build
```

**API**: http://localhost:3000  
**Swagger**: http://localhost:3000/api/docs

## Quick Start (Local Development)

```bash
# Install dependencies
yarn install

# Start PostgreSQL (or use Docker Compose for just postgres)
# Update .env: DB_HOST=localhost

# Run migrations
yarn migration:run

# Start development server
yarn start:dev
```

## Test the API

### 1. Ingest an Event

```bash
curl -X POST http://localhost:3000/ingest \
  -H "X-API-Key: test-key-tenant-a" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt_001",
    "eventType": "log",
    "serviceName": "api-gateway",
    "timestamp": "2026-01-21T12:00:00Z",
    "payload": {
      "level": "info",
      "message": "User logged in",
      "userId": "12345"
    }
  }'
```

### 2. Query Events

```bash
curl -X POST http://localhost:3000/query \
  -H "X-API-Key: test-key-tenant-a" \
  -H "Content-Type: application/json" \
  -d '{
    "page": 1,
    "limit": 10
  }'
```

## Available API Keys

- `test-key-tenant-a` → tenant-a
- `test-key-tenant-b` → tenant-b
- `demo-key` → demo-tenant

## Documentation

- **README.md**: Complete documentation
- **SYSTEM_DESIGN.md**: System design and architecture
- **Swagger UI**: Interactive API documentation at `/api/docs`

## Project Structure

- `src/modules/ingest/`: Event ingestion
- `src/modules/query/`: Event querying
- `src/common/middleware/`: Auth + Rate limiting
- `src/database/`: Entities + Migrations
- `src/observability/`: Logging + Tracing

## Key Features

✅ Idempotent ingestion  
✅ Multi-tenant isolation  
✅ Rate limiting (1000 req/min)  
✅ Batch processing  
✅ Flexible querying  
✅ Comprehensive observability
