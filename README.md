
# ShipNow API

A RESTful backend API for managing users, products, orders, deliveries, and shipment tracking.

Built with **Node.js, Express, MongoDB, and Mongoose**, ShipNow follows a layered architecture and includes structured logging, centralized error handling, API documentation, automated testing, file uploads, and Docker-based deployment.

## Features

- RESTful API with layered architecture
- MongoDB persistence using Mongoose
- User and product management
- Order processing with validated status transitions
- Delivery creation, driver assignment, and shipment tracking
- Concurrency-safe delivery operations
- Pagination and request validation
- Mock data generation and database seeding
- File uploads with type and size validation
- Centralized error handling
- Structured logging with Winston
- Interactive Swagger/OpenAPI documentation
- Automated integration and concurrency testing
- Application health monitoring
- Multi-stage Docker build and Docker Compose deployment

## Technology Stack

| Category | Technology |
| --- | --- |
| Runtime | Node.js 22 |
| Framework | Express.js 5 |
| Database | MongoDB 7 |
| ODM | Mongoose 9 |
| Logging | Winston |
| Documentation | Swagger / OpenAPI 3.0 |
| Testing | Mocha, Chai, Supertest |
| File uploads | Multer, file-type |
| Mock data | Faker |
| Development | Nodemon |
| Containerization | Docker, Docker Compose |

## Architecture

ShipNow uses a layered architecture that separates HTTP handling, business logic, and database operations.

```text
HTTP Request
     |
     v
   Routes
     |
     v
 Controllers
     |
     v
  Services
     |
     v
 Repositories
     |
     v
 Mongoose Models
     |
     v
   MongoDB
```

### Layer Responsibilities

| Layer | Responsibility |
| --- | --- |
| Routes | Define API endpoints and connect requests to controllers |
| Controllers | Handle HTTP requests and responses |
| Services | Implement business logic and validation |
| Repositories | Encapsulate database operations |
| Models | Define schemas, indexes, and relationships |
| Middlewares | Process uploads, validation, and errors |
| Configuration | Manage environments, logging, and database connections |

The Express application is exported independently from the HTTP server, allowing integration tests to run without opening a network listener.

### Project Structure

```text
shipnow-api/
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── docs/
│   ├── errors/
│   ├── middlewares/
│   ├── models/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── server.js
├── tests/
├── uploads/
├── logs/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

The `uploads/` and `logs/` directories contain generated runtime files and are excluded from version control.

## Getting Started

### Prerequisites

For local development:

- Node.js 22
- npm
- MongoDB
- Git

Alternatively, Docker Desktop can run the application and MongoDB together without requiring a separate local MongoDB installation.

### Installation

Clone the repository:

```bash
git clone <repository-url>
cd shipnow-api
```

Install dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow
LOG_LEVEL=debug
```

Configuration is validated during application startup.

Supported environments:

- `development`
- `test`
- `production`

The application also supports an optional `EXTERNAL_SERVICE_URL` configuration value.

Environment files containing credentials must not be committed to version control.

### Run Locally

Ensure MongoDB is running, then start the development server:

```bash
npm run dev
```

Alternatively:

```bash
npm start
```

The API is available by default at:

```text
http://localhost:8080
```

## API Reference

### Main Endpoints

| Resource | Method | Endpoint | Description |
| --- | --- | --- | --- |
| Users | GET | `/api/users` | List users |
| Users | POST | `/api/users` | Create user |
| Users | GET | `/api/users/:id` | Get user |
| Users | PUT | `/api/users/:id` | Update user |
| Products | GET | `/api/products` | List products |
| Products | GET | `/api/products/available` | List available products |
| Products | GET | `/api/products/:id` | Get product |
| Products | POST | `/api/products` | Create product |
| Products | PUT | `/api/products/:id` | Update product |
| Orders | GET | `/api/orders` | List orders |
| Orders | POST | `/api/orders` | Create order |
| Orders | GET | `/api/orders/:id` | Get order |
| Orders | PATCH | `/api/orders/:id/status` | Update order status |
| Deliveries | GET | `/api/deliveries` | List deliveries |
| Deliveries | POST | `/api/deliveries` | Create delivery |
| Deliveries | GET | `/api/deliveries/:id` | Get delivery |
| Deliveries | PATCH | `/api/deliveries/:id/driver` | Assign driver |
| Deliveries | PATCH | `/api/deliveries/:id/status` | Update delivery status |
| Deliveries | GET | `/api/deliveries/:id/tracking` | Get tracking history |
| Health | GET | `/health` | Application health check |

Interactive documentation, including request schemas and supported error responses, is available through Swagger:

```text
http://localhost:8080/api/docs/
```

### Pagination

List endpoints support pagination through `page` and `limit` query parameters.

Example:

```http
GET /api/orders?page=1&limit=10
```

| Parameter | Default | Constraint |
| --- | --- | --- |
| `page` | 1 | Positive integer |
| `limit` | 10 | Integer between 1 and 100 |

Example response:

```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

Queries use MongoDB pagination with deterministic sorting and document counts.

Invalid pagination parameters return HTTP `400` with the error code `INVALID_PAGINATION`.

## Users

Users can be created, retrieved, listed, and updated.

### Create User

```http
POST /api/users
```

Example request:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

Email addresses are normalized and checked for duplicates.

New users receive the default `user` role.

Duplicate email addresses return HTTP `409 Conflict`.

## Products

Products support creation, retrieval, updates, pagination, and availability filtering.

### Create Product

```http
POST /api/products
```

Example request:

```json
{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling Bluetooth headphones",
  "price": 120,
  "stock": 15
}
```

Product availability is derived from stock.

Products with zero stock are marked `out_of_stock`.

### Available Products

```http
GET /api/products/available?page=1&limit=10
```

Returns products with available status and stock greater than zero.

## Orders

Orders are associated with existing users and support controlled status transitions.

### Create Order

```http
POST /api/orders
```

Example:

```json
{
  "user": "507f1f77bcf86cd799439011",
  "total": 125.5,
  "deliveryAddress": "123 Main Street",
  "priority": "normal"
}
```

A valid, existing user is required.

### Order Statuses

```text
pending
confirmed
in_transit
delivered
cancelled
```

Allowed transitions:

```text
pending
   |
   v
confirmed
   |
   v
in_transit
   |
   v
delivered
```

Orders can also transition to `cancelled` from `pending`, `confirmed`, or `in_transit`.

Both `delivered` and `cancelled` are terminal states.

### Update Order Status

```http
PATCH /api/orders/:id/status
```

Example:

```json
{
  "status": "confirmed"
}
```

Invalid transitions return HTTP `409 Conflict` with `INVALID_ORDER_TRANSITION`.

## Deliveries and Tracking

The Delivery API manages shipment creation, driver assignment, delivery status transitions, and tracking history.

Each delivery references an existing order. A unique database index ensures that each order can have only one delivery.

### Create Delivery

```http
POST /api/deliveries
```

Example:

```json
{
  "order": "507f1f77bcf86cd799439011",
  "estimatedDeliveryDate": "2027-01-15T12:00:00.000Z"
}
```

New deliveries begin in `pending` status.

Attempts to create duplicate deliveries return HTTP `409 Conflict` with `DELIVERY_ALREADY_EXISTS`.

### Assign Driver

```http
PATCH /api/deliveries/:id/driver
```

Example:

```json
{
  "driver": "507f1f77bcf86cd799439012"
}
```

The driver must already exist.

Driver assignment or reassignment is permitted while a delivery is `pending` or `assigned`.

### Delivery Lifecycle

```text
pending
   |
   v
assigned
   |
   v
in_transit
   |
   v
delivered
```

A driver must be assigned before transitioning from `pending` to `assigned`.

All status transitions are validated against the current persisted delivery state.

### Update Delivery Status

```http
PATCH /api/deliveries/:id/status
```

Example:

```json
{
  "status": "in_transit",
  "note": "Package dispatched"
}
```

Tracking notes are optional and limited to 500 characters.

Each successful status transition records a new tracking event containing the updated status, timestamp, and note.

Invalid transitions return HTTP `409 Conflict` with `INVALID_DELIVERY_TRANSITION`.

### Tracking History

```http
GET /api/deliveries/:id/tracking
```

Returns the delivery identifier, associated order, current status, and recorded tracking events.

Tracking records provide a chronological history of delivery status updates.

### Concurrency Protection

Delivery operations use database-level safeguards to maintain consistency during simultaneous requests.

**Duplicate prevention**

A unique MongoDB index on `Delivery.order` prevents concurrent requests from creating multiple deliveries for one order.

**Atomic status transitions**

Conditional database updates ensure that only a request matching the current delivery state can advance its status.

If two concurrent requests attempt the same transition, only one succeeds. The other receives a conflict response.

These behaviors are verified by dedicated concurrency tests.

## File Uploads

ShipNow supports multipart file uploads for user documents, order delivery proofs, and driver licenses.

| Method | Endpoint | File field |
| --- | --- | --- |
| POST | `/api/users/:id/documents` | `document` |
| POST | `/api/orders/:id/proof` | `proof` |
| POST | `/api/drivers/:id/license` | `license` |

### Upload User Document

```bash
curl -X POST \
  http://localhost:8080/api/users/USER_ID/documents \
  -F "documentType=identity" \
  -F "document=@./identity.pdf"
```

Supported user document categories:

- `identity`
- `passport`
- `address`

### Upload Delivery Proof

```bash
curl -X POST \
  http://localhost:8080/api/orders/ORDER_ID/proof \
  -F "proof=@./delivery.png"
```

### Upload Driver License

```bash
curl -X POST \
  http://localhost:8080/api/drivers/DRIVER_ID/license \
  -F "license=@./license.pdf"
```

Each driver has one active license. Successful replacements remove the previous file while rejected replacements preserve the existing license.

### File Validation

| Property | Behavior |
| --- | --- |
| Accepted formats | PDF, JPEG, PNG |
| Maximum size | 5 MB |
| Content validation | MIME type and file signature |
| Filename generation | Timestamp and UUID |
| Storage | Local filesystem |
| Metadata | MongoDB |
| Rejected uploads | Automatic cleanup |

Files are stored in:

```text
uploads/documents/
uploads/proofs/
uploads/licenses/
```

Upload validation includes checks for unsupported formats, disguised files, oversized uploads, missing files, invalid resource IDs, and invalid multipart fields.

File metadata is stored on the associated MongoDB document.

## Mock Data and Seeding

The application uses Faker to generate realistic mock records.

### Mock Generation

```http
GET /api/mocks/users?qty=5
GET /api/mocks/drivers?qty=5
GET /api/mocks/orders?qty=5
GET /api/mocks/deliveries?qty=5
```

Mock generation returns data without persisting it to MongoDB.

The `qty` parameter defaults to 10 and accepts integers between 1 and 100.

### Database Seeding

```http
POST /api/mocks/seed?qty=10
```

Unlike mock generation, this endpoint inserts related records into MongoDB.

Records are created in an order that preserves references between users, drivers, orders, and deliveries.

Mock endpoints are available in development and test environments but are disabled in production.

## Error Handling

ShipNow uses a centralized error dictionary and a reusable `AppError` class.

Application errors return consistent JSON responses.

Example:

```json
{
  "status": "error",
  "errorCode": "ORDER_NOT_FOUND",
  "statusCode": 404,
  "message": "Order not found"
}
```

### Common Error Codes

| Error code | HTTP status |
| --- | --- |
| INVALID_ID | 400 |
| INVALID_PAGINATION | 400 |
| INVALID_USER_DATA | 400 |
| USER_NOT_FOUND | 404 |
| EMAIL_ALREADY_REGISTERED | 409 |
| PRODUCT_NOT_FOUND | 404 |
| INVALID_ORDER_DATA | 400 |
| ORDER_NOT_FOUND | 404 |
| INVALID_ORDER_STATUS | 400 |
| INVALID_ORDER_TRANSITION | 409 |
| INVALID_DELIVERY_DATA | 400 |
| DELIVERY_NOT_FOUND | 404 |
| DELIVERY_ALREADY_EXISTS | 409 |
| INVALID_DELIVERY_STATUS | 400 |
| INVALID_DELIVERY_TRANSITION | 409 |
| DRIVER_REQUIRED | 400 |
| DRIVER_NOT_FOUND | 404 |
| INVALID_TRACKING_NOTE | 400 |
| INVALID_MOCK_QUANTITY | 400 |
| ROUTE_NOT_FOUND | 404 |
| INTERNAL_SERVER_ERROR | 500 |

Unexpected errors return a generic response without exposing internal exception details.

Relevant technical information remains available through application logs.

## Logging

ShipNow uses Winston for structured application logging.

### Log Levels

```text
fatal
error
warning
info
http
debug
```

### Log Destinations

| Destination | Contents |
| --- | --- |
| `logs/error.log` | Error and fatal messages |
| `logs/combined.log` | Messages permitted by the configured log level |
| Console | Development only |

Log files use JSON formatting with timestamps and optional metadata.

Example:

```json
{
  "level": "error",
  "message": "Database operation failed",
  "timestamp": "2026-11-19T20:50:25.152Z"
}
```

The `LOG_LEVEL` environment variable controls the minimum recorded severity.

Console logging is disabled in test and production environments.

A diagnostic endpoint is available only during development:

```http
GET /api/logger/test
```

## API Documentation

ShipNow uses Swagger UI and the OpenAPI 3.0 specification.

Start the application and visit:

```text
http://localhost:8080/api/docs/
```

Documentation includes endpoint descriptions, parameters, request bodies, response schemas, error codes, and multipart upload requirements.

Reusable schemas provide consistent definitions across the API.

Delivery-specific documentation includes all six Delivery and Tracking endpoints.

## Testing

Automated tests use Mocha, Chai, and Supertest.

The suite includes HTTP integration tests against the Express application and direct verification of selected configuration and database behaviors.

### Test Configuration

Create a `.env.test` file:

```env
NODE_ENV=test
PORT=8081
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow_test
LOG_LEVEL=debug
```

**Warning:** The test suite removes documents from the dedicated `shipnow_test` database between tests.

Never point the test environment at a database containing important data.

### Run All Tests

```bash
npm test
```

### Run Specific Test Groups

Delivery concurrency:

```bash
npm test -- --grep "Delivery Concurrency API"
```

Swagger documentation:

```bash
npm test -- --grep "Delivery Swagger Documentation"
```

Winston configuration:

```bash
npm test -- --grep "Winston Logger Configuration"
```

### Test Coverage Areas

- Users and data validation
- Products and stock availability
- Orders and status transitions
- Deliveries and driver assignment
- Tracking history
- Concurrent delivery creation
- Concurrent status transitions
- Pagination and input validation
- Mock generation and database seeding
- File uploads and cleanup
- Standardized error handling
- Winston configuration and filtering
- Swagger/OpenAPI documentation
- Health checks and environment-specific routes

### Latest Verified Test Run

November 19, 2026:

```text
111 passing
0 failing
```

This reflects successful automated test execution, not a measured percentage of code coverage.

## Health Monitoring

The API exposes a health-check endpoint:

```http
GET /health
```

Example:

```json
{
  "status": "OK",
  "environment": "production",
  "uptime": 97.04,
  "timestamp": "2026-11-19T21:04:35.060Z"
}
```

The endpoint reports application process health.

MongoDB availability is also checked through the database connection lifecycle and Docker Compose health configuration.

## Docker Deployment

ShipNow supports deployment using a multi-stage Docker image and Docker Compose.

### Dockerfile

The Dockerfile uses two stages:

1. **Dependencies:** installs production dependencies using `npm ci --omit=dev`.
2. **Runtime:** copies dependencies and source code into a minimal Node.js 22 runtime.

The final container:

- Runs as the non-root `node` user.
- Exposes port `8080`.
- Creates writable log and upload directories.
- Includes an HTTP health check.
- Excludes unnecessary development dependencies.

### Build the Image

```bash
docker build -t shipnow-api:local .
```

### Docker Compose Services

The Compose configuration includes:

| Service | Description |
| --- | --- |
| `api` | ShipNow application |
| `mongodb` | MongoDB 7 database |

The API connects to MongoDB through the Compose network:

```env
MONGODB_URI=mongodb://mongodb:27017/shipnow
```

The hostname `mongodb` refers to the MongoDB service inside the Compose network.

### Persistent Volumes

| Volume | Purpose |
| --- | --- |
| `mongo_data` | MongoDB database |
| `uploads_data` | Uploaded files |
| `logs_data` | Winston log files |

Named volumes preserve data across ordinary container restarts and recreation.

### Start with Docker Compose

Validate the configuration:

```bash
docker compose config --quiet
```

Build and start services:

```bash
docker compose up -d --build
```

If the image has already been built:

```bash
docker compose up -d --no-build
```

### Check Container Status

```bash
docker compose ps
```

Both the API and MongoDB should report healthy status after startup.

### Verify the API

```bash
curl -i http://localhost:8080/health
curl -i http://localhost:8080/api/users
curl -i http://localhost:8080/api/deliveries
curl -I http://localhost:8080/api/docs/
```

The API endpoints should return HTTP `200`. Swagger is available at `/api/docs/`.

### View Logs

Container startup logs:

```bash
docker compose logs --tail=50 api
```

Winston application logs:

```bash
docker compose exec api cat logs/combined.log
docker compose exec api cat logs/error.log
```

### Stop Services

```bash
docker compose down
```

This stops and removes containers while preserving named volumes.

To remove persistent volumes as well:

```bash
docker compose down -v
```

**Warning:** Removing volumes permanently deletes the associated persisted data.

## Environment-Specific Behavior

| Feature | Development | Test | Production |
| --- | --- | --- | --- |
| Main API | Enabled | Enabled | Enabled |
| Swagger | Enabled | Enabled | Enabled |
| Health endpoint | Enabled | Enabled | Enabled |
| Mock routes | Enabled | Enabled | Disabled |
| Logger diagnostic route | Enabled | Disabled | Disabled |
| Console logging | Enabled | Disabled | Disabled |
| File logging | Enabled | Enabled | Enabled |

Diagnostic functionality is restricted to its intended environments.

## Security Considerations

The application implements:

- Environment configuration validation
- Centralized error handling
- MongoDB resource ID validation
- Pagination and request size limits
- File type and size validation
- File-signature verification
- Rejected-upload cleanup
- Non-root Docker execution
- Environment-specific diagnostic routes
- Unique database indexes
- Atomic delivery status updates
- Exclusion of secrets and runtime files from version control

### Production Considerations

ShipNow is a backend demonstration project and should not be exposed publicly with sensitive data without additional security controls.

Potential production enhancements include:

- Authentication and role-based authorization
- Rate limiting and additional API security
- Antivirus scanning for uploaded files
- Secure database authentication and network isolation
- Monitoring and alerting
- Dependency vulnerability remediation
- Backup and recovery procedures
- CI/CD automation

## License

No license has been specified for this repository.
