# ShipNow API

ShipNow API is a backend REST API designed for a logistics company to manage users, products, orders, drivers, deliveries, and test data.

The project follows a layered architecture that separates HTTP handling, business logic, database access, data models, and centralized error handling. This structure improves maintainability, testability, consistency, and scalability as the application grows.

## Tech Stack

- Node.js

- Express.js

- MongoDB

- Mongoose

- dotenv

- Faker

- Nodemon

- Winston

- winston-daily-rotate-file

- swagger-jsdoc

- swagger-ui-express
- Mocha
- Chai
- Supertest
- Multer
- file-type

## Architecture

The application follows this dependency flow:

```text

Route → Controller → Service → Repository → Model → MongoDB

                       ↓

                  AppError

                       ↓

             Global Error Middleware

```

### Routes

Define the API endpoints and connect each request to the appropriate Controller.

### Controllers

Handle the HTTP layer.

Controllers receive requests, extract parameters or request bodies, call the appropriate Service, and return successful HTTP responses.

When an error occurs, Controllers pass it to the global error middleware using `next(error)`.

Controllers do not contain business logic or communicate directly with MongoDB.

### Services

Contain the application's business logic.

Examples include:

- Determining product availability based on stock

- Preventing negative product prices or stock

- Normalizing user email addresses

- Preventing duplicate email registrations

- Validating MongoDB resource IDs

- Generating simulated test data

- Validating mock data quantities

- Coordinating relationships between generated users, orders, deliveries, and drivers

- Handling resources that do not exist

- Converting expected domain failures into controlled `AppError` instances

### Repositories

Encapsulate database access.

Repositories are responsible for querying and modifying data through Mongoose, including filters, projections, sorting, and persistence operations.

The mocks repository also provides bulk insertion of generated test records using `insertMany()`.

Keeping database access inside repositories prevents the business layer from depending directly on MongoDB operations.

### Models

Define the MongoDB schemas, relationships, and validation rules for application entities.

The application currently includes models for:

- Users

- Products

- Drivers

- Orders

- Deliveries
- Reusable uploaded-file metadata subdocuments

### Error Layer

Application errors are centralized through three components:

- `AppError` represents controlled application and domain errors.

- `ERROR_DICTIONARY` centralizes error codes, HTTP status codes, and public messages.

- `errorHandler` is the global Express middleware responsible for producing the final error response.

This keeps error responses consistent and prevents business logic from manually formatting HTTP errors.

## Project Structure

```text

src/

├── config/

│   ├── database.config.js

│   ├── env.config.js

│   ├── logger.config.js
│   └── multer.config.js

├── constants/

│   └── index.js

├── controllers/

│   ├── orders.controller.js
│   ├── mocks.controller.js

│   ├── products.controller.js

│   ├── users.controller.js
│   └── uploads.controller.js

├── docs/

│   ├── swagger.config.js

│   ├── orders.yaml
│   ├── schemas.yaml

│   ├── users.yaml

│   ├── products.yaml

│   ├── mocks.yaml

│   ├── logger.yaml
│   └── uploads.yaml

├── errors/

│   ├── app.error.js

│   └── error.dictionary.js

├── middlewares/

│   ├── error.middleware.js
│   └── upload.middleware.js

├── models/

│   ├── delivery.model.js

│   ├── driver.model.js

│   ├── order.model.js

│   ├── product.model.js

│   ├── user.model.js
│   └── file-metadata.schema.js

├── repositories/

│   ├── orders.repository.js
│   ├── mocks.repository.js

│   ├── products.repository.js

│   ├── users.repository.js
│   └── uploads.repository.js

├── routes/

│   ├── orders.routes.js
│   ├── logger.routes.js

│   ├── mocks.routes.js

│   ├── products.routes.js

│   ├── users.routes.js
│   └── drivers.routes.js

├── services/

│   ├── orders.service.js
│   ├── mocks.service.js

│   ├── products.service.js

│   ├── users.service.js
│   └── uploads.service.js

├── app.js

└── server.js

```

## Environment Configuration

Environment variables are loaded and validated through a centralized configuration layer.

Required variables:

```env

PORT=

MONGODB_URI=

NODE_ENV=

```

If a required environment variable is missing, the application stops during startup with a descriptive error.

The `.env` and `.env.test` files should be excluded from version control.

Use `.env.example` as a template for local configuration.

## Installation

Clone the repository and install the dependencies:

```bash

npm install

```

Create a `.env` file based on `.env.example`:

```env

PORT=8080

MONGODB_URI=mongodb://localhost:27017/shipnow

NODE_ENV=development

```

Make sure MongoDB is running locally, then start the development server:

```bash

npm run dev

```

The API will be available at:

```text

http://localhost:8080

```

## Interactive API Documentation (Swagger / OpenAPI)

ShipNow provides interactive documentation using **OpenAPI 3.0**, **swagger-jsdoc**, and **swagger-ui-express**. The Swagger configuration is kept separate from route logic in `src/docs/swagger.config.js`; endpoint descriptions and reusable schemas are defined in YAML files under `src/docs/`.

With the server running, open:

```text

http://localhost:8080/api/docs

```

Swagger UI lets you inspect HTTP methods, paths, parameters, JSON request bodies, successful responses, and documented error responses. Use **Try it out → Execute** to send requests to your running local API.

### Documented Modules

| Module | Coverage |
| --- | --- |
| Users | List, retrieve by ID, create, and update users |
| Products | List, list available, retrieve by ID, create, and update products |
| Orders | List, create, retrieve by ID, and update order status |
| Mocks | Generate mock users, drivers, orders, and deliveries; seed the database |
| Logger | Development-only logging validation (`GET /api/logger/test`) |
| Uploads | User documents, order delivery proofs, driver licenses |

Order endpoints operate on persisted orders. Mock generation endpoints return simulated data and are separate from the Orders API. Deliveries have a data model and mock-generation endpoint; dedicated delivery CRUD routes are not implemented.

### Reusable Schemas

The existing OpenAPI components define reusable schemas including: `User`, `Product`, `Driver`, `Order`, `OrderItem`, `Delivery`, `SuccessResponse`, and `ErrorResponse`. Endpoint definitions reference shared schemas using `$ref` where applicable.

The documented errors include invalid resource IDs, missing resources, duplicate email addresses, invalid prices or stock, invalid mock quantities, database seeding failures, and internal server errors. Authentication endpoints and delivery status-transition endpoints are not implemented. Order status updates are available at `PATCH /api/orders/:id/status`.

### Testing Notes

1\. Start MongoDB and run `npm run dev` with `NODE_ENV=development`.

2\. Open `http://localhost:8080/api/docs` and expand an endpoint.

3\. Select **Try it out**, enter any required values, then select **Execute**.

4\. For a read-only test, use `GET /api/mocks/users?qty=2`; try `qty=0` to verify the documented HTTP `400` error.

5\. `POST /api/mocks/seed` **writes records to MongoDB**; only execute it when you intend to create test data.

6\. `GET /api/logger/test` is a diagnostic endpoint, not a business feature. It works in development and returns HTTP `404` outside development.

Changes to YAML documentation may require restarting the server before they appear in Swagger UI.

## Product Endpoints

### Get all products

```http

GET /api/products

```

### Get available products

```http

GET /api/products/available

```

Returns products that are available and have stock greater than zero.

### Get product by ID

```http

GET /api/products/:id

```

### Create product

```http

POST /api/products

```

Example body:

```json

{

  "name": "Wireless Headphones",

  "description": "Noise-cancelling Bluetooth headphones",

  "price": 120,

  "stock": 15

}

```

Product status is determined automatically from stock.

### Update product

```http

PUT /api/products/:id

```

Example body:

```json

{

  "stock": 0

}

```

Setting stock to `0` automatically changes the product status to `out_of_stock`.

## User Endpoints

### Get all users

```http

GET /api/users

```

### Get user by ID

```http

GET /api/users/:id

```

### Create user

```http

POST /api/users

```

Example body:

```json

{

  "firstName": "John",

  "lastName": "Doe",

  "email": "john.doe@example.com"

}

```

New users receive the `user` role by default.

Email addresses are normalized before being stored.

### Update user

```http

PUT /api/users/:id

```

Example body:

```json

{

  "firstName": "Johnny",

  "email": "johnny.doe@example.com"

}

```

Duplicate email addresses are rejected with HTTP `409 Conflict`.

## Order Endpoints

Orders are persisted in MongoDB and reference existing users. Supported statuses are `pending`, `confirmed`, `in_transit`, `delivered`, and `cancelled`; priorities are `low`, `normal`, and `high`.

### List orders

```http
GET /api/orders
```

### Create an order

```http
POST /api/orders
```

Example request body (replace the user ID with an existing user's MongoDB `_id`):

```json
{
  "user": "000000000000000000000001",
  "total": 125.50,
  "deliveryAddress": "123 Main Street",
  "priority": "normal"
}
```

A valid existing user, nonnegative total, and delivery address are required. New orders default to `pending` status unless a valid initial status is supplied.

### Retrieve an order

```http
GET /api/orders/:id
```

### Update order status

```http
PATCH /api/orders/:id/status
```

Example request body:

```json
{
  "status": "confirmed"
}
```

Allowed transitions are `pending` → `confirmed` or `cancelled`; `confirmed` → `in_transit` or `cancelled`; and `in_transit` → `delivered` or `cancelled`. `delivered` and `cancelled` are terminal states.

Invalid IDs, missing orders, invalid statuses, and disallowed transitions return standardized errors (including HTTP `400`, `404`, and `409` as appropriate).

## Mock Data Endpoints

The `/api/mocks` router generates simulated ShipNow data using Faker.

Generated data follows the application's domain constants and model structure.

The quantity is controlled through the `qty` query parameter. Valid quantities are integers between `1` and `100`. If `qty` is omitted, the default is `10`.

### Generate mock users

```http

GET /api/mocks/users?qty=2

```

Generates users in memory without saving them to MongoDB.

### Generate mock drivers

```http

GET /api/mocks/drivers?qty=2

```

Generates drivers with the `driver` role, vehicle information, and availability status.

The generated records are not saved to MongoDB.

### Generate mock orders

```http

GET /api/mocks/orders?qty=2

```

Generates orders with valid statuses, priorities, totals, and delivery addresses.

The generated records are not saved to MongoDB.

### Generate mock deliveries

```http

GET /api/mocks/deliveries?qty=2

```

Generates deliveries with valid delivery statuses and estimated delivery dates.

The generated records are not saved to MongoDB.

### Seed test data

```http

POST /api/mocks/seed?qty=10

```

Generates and inserts related test records into MongoDB.

For each requested quantity, the seed operation creates:

- Users

- Drivers

- Orders

- Deliveries

The records are inserted in the required order so real MongoDB references can be established.

```text

User → Order → Delivery ← Driver

```

Orders reference generated users.

Deliveries reference generated orders and drivers.

Example response:

```json

{

  "status": "success",

  "inserted": {

    "users": 10,

    "drivers": 10,

    "orders": 10,

    "deliveries": 10

  }

}

```

Unlike the mock `GET` endpoints, the seed endpoint persists the generated records in MongoDB.

If persistence fails during the seed operation, the error is converted into a controlled `MOCK_SEED_FAILED` application error instead of exposing the underlying database error to the client.

## Domain Constants

Application roles, product statuses, order statuses, order priorities, and delivery statuses are centralized as immutable constants.

User roles:

```text

ADMIN

USER

DRIVER

```

Product statuses:

```text

AVAILABLE

OUT_OF_STOCK

```

Order statuses:

```text

PENDING

CONFIRMED

IN_TRANSIT

DELIVERED

CANCELLED

```

Order priorities:

```text

LOW

NORMAL

HIGH

```

Delivery statuses:

```text

PENDING

ASSIGNED

IN_TRANSIT

DELIVERED

```

This avoids scattering magic strings throughout the application and ensures generated test data follows the same domain rules as persisted application data.

## Data Relationships

Orders reference the user who created them:

```text

Order.user → User._id

```

Deliveries reference an order and an assigned driver:

```text

Delivery.order → Order._id

Delivery.driver → Driver._id

```

During test-data seeding, users and drivers are inserted first. Their MongoDB IDs are then used when creating orders and deliveries, ensuring that generated relationships reference real persisted records.

## Mock Quantity Validation

Mock generation accepts between `1` and `100` records per request.

Valid example:

```http

GET /api/mocks/users?qty=20

```

Invalid quantities such as:

```text

qty=0

qty=-5

qty=abc

qty=101

```

return HTTP `400 Bad Request` using the centralized error format:

```json

{

  "status": "error",

  "errorCode": "INVALID_MOCK_QUANTITY",

  "statusCode": 400,

  "message": "Quantity must be an integer between 1 and 100"

}

```

## Centralized Error Handling

The API uses a common error layer so expected failures produce clear, predictable, and uniform HTTP responses.

Business and validation errors are represented by the custom `AppError` class.

Instead of creating isolated errors such as:

```js

const error = new Error("Product not found");

error.statusCode = 404;

throw error;

```

Services use the centralized error dictionary:

```js

throw new AppError(ERROR_DICTIONARY.PRODUCT_NOT_FOUND);

```

The error dictionary defines the public error code, HTTP status code, and message in one place.

The global error middleware is registered after the application routes and is responsible for producing the final HTTP error response.

The standard error structure is:

```json

{

  "status": "error",

  "errorCode": "PRODUCT_NOT_FOUND",

  "statusCode": 404,

  "message": "Product not found"

}

```

Unexpected errors are not exposed directly to clients. They return a generic response:

```json

{

  "status": "error",

  "errorCode": "INTERNAL_SERVER_ERROR",

  "statusCode": 500,

  "message": "Internal server error"

}

```

Technical error information remains available in server-side Winston logs for debugging.

### Error Dictionary

Controlled errors include (in addition to the upload-specific errors documented below):

```text

INVALID_USER_DATA         → 400 Bad Request
USER_NOT_FOUND            → 404 Not Found

EMAIL_ALREADY_REGISTERED  → 409 Conflict

PRODUCT_NOT_FOUND         → 404 Not Found

INVALID_ID                → 400 Bad Request

INVALID_PRICE             → 400 Bad Request

INVALID_STOCK             → 400 Bad Request

INVALID_MOCK_QUANTITY     → 400 Bad Request

MOCK_SEED_FAILED          → 500 Internal Server Error
ORDER_NOT_FOUND           → 404 Not Found
INVALID_ORDER_DATA        → 400 Bad Request
INVALID_ORDER_STATUS      → 400 Bad Request
INVALID_ORDER_TRANSITION  → 409 Conflict

ROUTE_NOT_FOUND           → 404 Not Found

```

### Invalid Resource IDs

MongoDB resource IDs are validated before they reach repository queries.

For example:

```http

GET /api/products/abc

```

returns:

```json

{

  "status": "error",

  "errorCode": "INVALID_ID",

  "statusCode": 400,

  "message": "Invalid resource ID"

}

```

A correctly formatted MongoDB ObjectId that does not reference an existing resource instead returns the corresponding `404` domain error.

Example:

```http

GET /api/products/000000000000000000000000

```

Response:

```json

{

  "status": "error",

  "errorCode": "PRODUCT_NOT_FOUND",

  "statusCode": 404,

  "message": "Product not found"

}

```

## Automated Functional Testing

The project uses **Mocha** as the test runner, **Chai** for assertions, and **Supertest** for HTTP integration testing against the exported Express application (`src/app.js`). The application is exported separately from `src/server.js`, so tests do not need to start an HTTP listener.

### Test environment

Run a local MongoDB instance and create a `.env.test` file with:

```env
NODE_ENV=test
PORT=8081
MONGODB_URI=mongodb://127.0.0.1:27017/shipnow_test
```

The test setup checks that `NODE_ENV=test` and the database path is `/shipnow_test` before connecting. The `beforeEach` hook **deletes all documents in every collection of `shipnow_test`** to isolate test cases; do not put valuable data in this database. The normal development database (`shipnow`) is separate and is not cleared by these tests.

### Run tests

```bash
npm install
npm test
```

The `npm test` script sets `NODE_ENV=test` and runs all `tests/**/*.test.js` files with Mocha. MongoDB must be running before executing the suite.

### Test suite

| Suite | Tests | Main checks |
| --- | ---: | --- |
| Users | 7 | List, creation, validation, duplicate email, invalid/missing IDs, unknown route |
| Orders | 12 | List, create, retrieve, status update, validation, missing resources, invalid transitions |
| Mocks | 15 | Generated data structures, default/custom quantities, invalid quantities, database seeding |
| Logger | 3 | Test environment isolation and development-only endpoint restriction |
| Swagger | 5 | Swagger UI, OpenAPI version, paths, reusable schemas, documented error responses |
| Uploads API | 14 | File uploads, validation, cleanup, license replacement |
| Uploads Swagger | 3 | Multipart upload schemas and documented responses |
| **Total** | **59** | **All passing in the latest local run** |

Tests assert HTTP status codes, success response shapes, selected data types, and standardized error payloads. Seeded mock data is stored only in the isolated test database during automated tests.

The logger diagnostic endpoint is intentionally unavailable under `NODE_ENV=test` and returns HTTP `404`. To manually exercise all six log levels, start the application in development mode and request `GET /api/logger/test`.

The suite covers the endpoints listed above; it is **not a measured line/branch coverage percentage**, and product endpoints are not yet included in this automated test suite.

## Testing Error Cases

The centralized error layer can be tested with the following requests.

### Invalid mock quantity

```http

GET /api/mocks/users?qty=0

GET /api/mocks/users?qty=-5

GET /api/mocks/users?qty=abc

## File Uploads — Module 7

Module 7 adds multipart file uploads through **Multer** and verifies the actual file signature with **file-type**. Files are stored on the local filesystem; structured metadata is persisted on the related MongoDB document.

### Endpoints and multipart fields

| Method | Endpoint | Required file field | Other required field | Stored on |
| --- | --- | --- | --- | --- |
| POST | `/api/users/:id/documents` | `document` | `documentType` | `User.documents[]` |
| POST | `/api/orders/:id/proof` | `proof` | — | `Order.deliveryProofs[]` |
| POST | `/api/drivers/:id/license` | `license` | — | `Driver.license` |

All three endpoints accept `multipart/form-data` and return **201 Created** after a successful upload. Replace the placeholder IDs in the examples below with IDs of existing MongoDB records.

**Upload a user document**

```bash
curl -X POST http://localhost:8080/api/users/USER_ID/documents \
  -F "documentType=identity" \
  -F "document=@./identity.pdf"
```

`documentType` must be one of `identity`, `passport`, or `address`. Each successful upload appends another document entry to the user.

**Upload an order delivery proof**

```bash
curl -X POST http://localhost:8080/api/orders/ORDER_ID/proof \
  -F "proof=@./delivery.png"
```

Each successful upload appends another entry to the order's `deliveryProofs` array.

**Upload or replace a driver's license**

```bash
curl -X POST http://localhost:8080/api/drivers/DRIVER_ID/license \
  -F "license=@./license.pdf"
```

Each driver has one active license. A successful replacement updates the stored metadata and removes the previous license file. If the new upload is rejected, the existing license is preserved.

### Storage and validation

| Property | Behavior |
| --- | --- |
| File storage | Local disk |
| User document directory | `uploads/documents/` |
| Order proof directory | `uploads/proofs/` |
| Driver license directory | `uploads/licenses/` |
| Allowed MIME types | `application/pdf`, `image/jpeg`, `image/png` |
| Maximum size | 5 MB (`5 * 1024 * 1024` bytes) |
| Generated filename | Timestamp + random UUID + extension |
| Content validation | `file-type` checks the file's detected MIME type against the declared MIME type |
| Rejected uploads | Newly stored file is deleted |
| Source control | `uploads/` must be ignored |

Multer's initial MIME filter rejects unsupported declarations. The service then checks actual file contents, so a renamed or disguised file cannot pass solely by claiming to be a PDF or image. An uploaded file with an invalid resource ID, invalid document type, missing target entity, or failed persistence is also cleaned up.

**Security scope:** This implementation checks file signatures and type/size limits; it is not antivirus scanning, user authorization, or cloud storage. The endpoints should not be treated as production-secure without additional access controls.

### File metadata in MongoDB

The reusable subdocument schema `src/models/file-metadata.schema.js` contains:

| Field | Purpose |
| --- | --- |
| `originalName` | Original client filename |
| `filename` | Generated disk filename |
| `path` | File path relative to the application working directory |
| `mimeType` | Uploaded MIME type, verified against detected content |
| `size` | Size in bytes |
| `documentType` | `identity`, `passport`, `address`, `delivery_proof`, or `driver_license` |
| `uploadedAt` | Upload timestamp |

User and order metadata is stored in arrays; a driver's active license is stored as one subdocument.

### Implementation flow

```text
Route
  → handleUpload(Multer middleware)
  → UploadsController
  → UploadsService
       → validate ID, file, document category, and actual content
       → find related entity
       → construct metadata
       → UploadsRepository
       → MongoDB update
       → clean up previous license (if replaced)
  → 201 response
```

On failure, the service removes the newly uploaded file and passes a standardized error through the existing global error layer. Successful and failed upload events are logged through Winston.

### Upload error codes

| HTTP status | Error code | Meaning |
| --- | --- | --- |
| 400 | `FILE_REQUIRED` | No file was provided |
| 400 | `INVALID_FILE_TYPE` | Unsupported, disguised, or invalid file |
| 400 | `INVALID_FILE_FIELD` | Unexpected multipart file field or file count |
| 400 | `INVALID_DOCUMENT_TYPE` | Invalid user document category |
| 400 | `INVALID_ID` | Invalid MongoDB ObjectId |
| 404 | `USER_NOT_FOUND` | User does not exist |
| 404 | `ORDER_NOT_FOUND` | Order does not exist |
| 404 | `DRIVER_NOT_FOUND` | Driver does not exist |
| 413 | `FILE_TOO_LARGE` | File exceeds 5 MB |
| 500 | `FILE_SAVE_FAILED` | Upload processing or metadata persistence failed |

### Swagger and tests for uploads

`src/docs/uploads.yaml` documents the three upload endpoints, multipart binary fields, required properties, successful responses, and error cases. With the server running, open `http://localhost:8080/api/docs`.

`tests/uploads.test.js` contains **14 integration tests**, covering valid PDF/PNG uploads, persisted metadata, missing/invalid files, MIME spoofing, size limits, unexpected fields, nonexistent entities, rejected-file cleanup, successful license replacement, and preservation of the old license on rejected replacement.

`tests/uploads.swagger.test.js` contains **3 tests** validating multipart schemas and documented responses.

## Dependency Audit — Module 7

The project was reviewed with:

```bash
npm audit
npm audit fix --dry-run
```

Compatible updates were then applied using `npm audit fix`, followed by a full test run. The reported vulnerabilities decreased from **11 to 7**. The latest audit still reported unresolved advisories, including one high-severity finding, in dependency chains involving tools such as Mocha, Swagger JSDoc, and Nodemon.

These findings are **not resolved**. Further updates require reviewing the advisory details, dependency compatibility, and regression tests. Avoid `npm audit fix --force` without assessing breaking changes.

## Course Progress and Scope

The Coderhouse Backend III reading material covers the following modules. The table distinguishes **implemented ShipNow work** from future coursework; it does not claim that every exercise in the reading material has been implemented.

| Course module | Subject | ShipNow status |
| --- | --- | --- |
| 1 | Professional layered architecture, environment configuration, constants | Implemented |
| 2 | Mocking and database seeding | Implemented |
| 3 | Centralized errors and error middleware | Implemented |
| 4 | Winston logging and rotating logs | Implemented |
| 5 | OpenAPI / Swagger documentation | Implemented |
| 6 | Functional testing with Mocha, Chai, and Supertest | Implemented |
| 7 | Multer file uploads, validation, metadata persistence | Implemented and tested |
| 8 | Performance, scalability, and Docker | Not yet implemented in this documented version |
| 9 | Final production-ready API consolidation | Not yet completed |

The course also discusses authentication exercises, Docker deployment, production hardening, and additional checks. These should not be mistaken for implemented features. In particular, the current API does not claim completed authentication/authorization, dedicated delivery CRUD endpoints, a health-check endpoint, or a Docker setup.

### Current verification and next steps

The latest confirmed local test suite contains **59 passing tests**:

- Users: 7
- Orders: 12
- Mocks: 15
- Logger: 3
- Existing Swagger: 5
- Uploads API: 14
- Uploads Swagger: 3

Run with a local MongoDB instance and the isolated `.env.test` configuration:

```bash
npm test
```

**Important:** The test setup clears collections in `shipnow_test` between tests. Never point it at a database containing valuable records.

Before committing or submitting, verify that `.env`, `.env.test`, `node_modules/`, `logs/`, and `uploads/` are excluded from Git, and check `git status --short`. The remaining audit findings should be reviewed before any production deployment.
