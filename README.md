# Telemetry Vault

A high-throughput telemetry ingestion service for logs, metrics, and traces with near-real-time query capabilities.

## Features

- **High-throughput ingestion** with batch processing
- **Idempotent writes** via unique constraints
- **Multi-tenant isolation** with API key authentication
- **Rate limiting** with sliding window algorithm
- **Flexible querying** with filtering, pagination, and aggregation
- **Observability** with structured logging and OpenTelemetry tracing
- **Production-ready** with Docker support and health checks

## Quick Start

### Prerequisites

- Node.js 18+ and Yarn
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker Compose)

### Installation

```bash
# Clone the repository
cd telemetry-vault

# Install dependencies
yarn install

# Copy environment file
cp .env.example .env

# Start services with Docker Compose
docker-compose up --build
```

The API will be available at `http://localhost:3000`  
Swagger documentation at `http://localhost:3000/api/docs`

### Local Development

```bash
# Start PostgreSQL (if not using Docker Compose)
# Update .env with DB_HOST=localhost

# Run migrations
yarn migration:run

# Start development server
yarn start:dev
```

## API Documentation

### Authentication

All endpoints require an API key passed via the `X-API-Key` header.

**Default API Keys** (configured in `.env`):
- `test-key-tenant-a` → tenant-a
- `test-key-tenant-b` → tenant-b
- `demo-key` → demo-tenant

### Endpoints

#### POST /ingest

Ingest single or multiple telemetry events.

**Request Body:**
```json
{
  "eventId": "evt_1234567890",
  "eventType": "log",
  "serviceName": "api-gateway",
  "timestamp": "2026-01-21T12:00:00Z",
  "payload": {
    "level": "info",
    "message": "User logged in",
    "userId": "12345"
  }
}
```

**Batch Request:**
```json
[
  { "eventId": "evt_001", "eventType": "log", ... },
  { "eventId": "evt_002", "eventType": "metric", ... }
]
```

**Response:**
```json
{
  "ingested": 10,
  "duplicates": 2,
  "message": "Events ingested successfully"
}
```

#### POST /query

Query events with filtering, pagination, and aggregation.

**Request Body:**
```json
{
  "startTime": "2026-01-20T00:00:00Z",
  "endTime": "2026-01-21T23:59:59Z",
  "eventType": "log",
  "serviceName": "api-gateway",
  "page": 1,
  "limit": 100
}
```

**Aggregation Request:**
```json
{
  "startTime": "2026-01-20T00:00:00Z",
  "endTime": "2026-01-21T23:59:59Z",
  "groupBy": "service"
}
```

**Response (Paginated):**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 1500,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

**Response (Aggregated):**
```json
{
  "data": [
    { "key": "api-gateway", "count": 1200 },
    { "key": "payment-service", "count": 300 }
  ],
  "total": 1500
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | Server port | `3000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_DATABASE` | Database name | `telemetry_vault` |
| `API_KEYS` | API keys (format: `key:tenant,key:tenant`) | See `.env.example` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window in milliseconds | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `1000` |
| `INGEST_BATCH_SIZE` | Batch size for ingestion | `100` |
| `LOG_LEVEL` | Logging level | `info` |
| `ENABLE_TRACING` | Enable OpenTelemetry tracing | `true` |

## Database Migrations

```bash
# Run migrations
yarn migration:run

# Revert last migration
yarn migration:revert

# Generate new migration
yarn migration:generate src/database/migrations/MigrationName

# Create empty migration
yarn migration:create src/database/migrations/MigrationName
```

## Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## Docker

### Build Image

```bash
docker build -t telemetry-vault .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

## Architecture

- **NestJS** - TypeScript framework for scalable server-side applications
- **TypeORM** - ORM for PostgreSQL with migration support
- **PostgreSQL** - Relational database with JSONB support
- **Winston** - Structured logging with daily rotation
- **OpenTelemetry** - Distributed tracing and observability
- **Swagger** - API documentation and testing

## Performance

**Expected Throughput:**
- Ingestion: >1000 events/sec
- Query latency: <100ms (p95)
- Idempotency overhead: <10ms

**Optimization Strategies:**
- Batch inserts (configurable batch size)
- Connection pooling (10-50 connections)
- Composite indexes on tenant + timestamp
- Unique constraint for idempotency (DB-level)

## Security

- API key authentication
- Multi-tenant data isolation
- Rate limiting per tenant
- Input validation with class-validator
- SQL injection protection via TypeORM

## Observability

- Structured JSON logging
- Request/response logging with duration
- OpenTelemetry tracing spans
- Rate limit headers
- Health checks

## License

UNLICENSED
