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
│   └── env.config.js
├── constants/
│   └── index.js
├── controllers/
│   ├── mocks.controller.js
│   ├── products.controller.js
│   └── users.controller.js
├── errors/
│   ├── app.error.js
│   └── error.dictionary.js
├── middlewares/
│   └── error.middleware.js
├── models/
│   ├── delivery.model.js
│   ├── driver.model.js
│   ├── order.model.js
│   ├── product.model.js
│   └── user.model.js
├── repositories/
│   ├── mocks.repository.js
│   ├── products.repository.js
│   └── users.repository.js
├── routes/
│   ├── mocks.routes.js
│   ├── products.routes.js
│   └── users.routes.js
├── services/
│   ├── mocks.service.js
│   ├── products.service.js
│   └── users.service.js
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

The `.env` file is excluded from version control.

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

Technical error information remains available on the server for debugging.

### Error Dictionary

Current controlled errors include:

```text
USER_NOT_FOUND            → 404 Not Found
EMAIL_ALREADY_REGISTERED  → 409 Conflict
PRODUCT_NOT_FOUND         → 404 Not Found
INVALID_ID                → 400 Bad Request
INVALID_PRICE             → 400 Bad Request
INVALID_STOCK             → 400 Bad Request
INVALID_MOCK_QUANTITY     → 400 Bad Request
MOCK_SEED_FAILED          → 500 Internal Server Error
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

## Testing Error Cases

The centralized error layer can be tested with the following requests.

### Invalid mock quantity

```http
GET /api/mocks/users?qty=0
GET /api/mocks/users?qty=-5
GET /api/mocks/users?qty=abc
GET /api/mocks/users?qty=101
```

Expected status:

```text
400 Bad Request
```

Expected error code:

```text
INVALID_MOCK_QUANTITY
```

### Invalid product price

```http
POST /api/products
```

```json
{
  "name": "Test Product",
  "description": "Testing centralized error handling",
  "price": -50,
  "stock": 10
}
```

Expected:

```text
400 Bad Request
INVALID_PRICE
```

### Invalid product stock

```http
POST /api/products
```

```json
{
  "name": "Test Product",
  "description": "Testing negative stock",
  "price": 50,
  "stock": -10
}
```

Expected:

```text
400 Bad Request
INVALID_STOCK
```

### Product not found

```http
GET /api/products/000000000000000000000000
```

Expected:

```text
404 Not Found
PRODUCT_NOT_FOUND
```

### User not found

```http
GET /api/users/000000000000000000000000
```

Expected:

```text
404 Not Found
USER_NOT_FOUND
```

### Invalid resource ID

```http
GET /api/products/abc
```

or:

```http
GET /api/users/abc
```

Expected:

```text
400 Bad Request
INVALID_ID
```

### Duplicate email

Create a user with an email address that already exists.

Expected:

```text
409 Conflict
EMAIL_ALREADY_REGISTERED
```

### Mock seed failure

Failures during MongoDB persistence are converted into:

```json
{
  "status": "error",
  "errorCode": "MOCK_SEED_FAILED",
  "statusCode": 500,
  "message": "Failed to seed mock data"
}
```

The underlying database error is not exposed to the client.

## Service vs Repository

The Service and Repository layers have intentionally different responsibilities.

The **Service layer** answers:

> What business rules should the application enforce?

For example, a product with zero stock becomes unavailable, two users cannot register the same email address, resource IDs must be valid, and mock quantities must remain within the allowed range.

The mock Service also coordinates how generated entities relate to each other and converts persistence failures into controlled application errors.

The **Repository layer** answers:

> How should the application read or write this data?

For example, it performs Mongoose queries, applies database filters and projections, sorts results, persists updates, and performs bulk insertion of generated test records.

This separation keeps business rules independent from the database implementation and makes the codebase easier to maintain, test, and extend.