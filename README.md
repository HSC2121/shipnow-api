# ShipNow API

ShipNow API is a backend REST API designed for a logistics company to manage users and products.

The project follows a layered architecture that separates HTTP handling, business logic, database access, and data models. This structure improves maintainability, testability, and scalability as the application grows.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv
- Nodemon

## Architecture

The application follows this dependency flow:

```text
Route → Controller → Service → Repository → Model → MongoDB
```

### Routes

Define the API endpoints and connect each request to the appropriate Controller.

### Controllers

Handle the HTTP layer.

Controllers receive requests, extract parameters or request bodies, call the appropriate Service, and return HTTP responses.

Controllers do not contain business logic or communicate directly with MongoDB.

### Services

Contain the application's business logic.

Examples include:

- Determining product availability based on stock
- Preventing negative product prices or stock
- Normalizing user email addresses
- Preventing duplicate email registrations
- Handling resources that do not exist

### Repositories

Encapsulate database access.

Repositories are responsible for querying and modifying data through Mongoose, including filters, projections, sorting, and persistence operations.

Keeping database access inside repositories prevents the business layer from depending directly on MongoDB or Mongoose.

### Models

Define the MongoDB schemas and validation rules for application entities.

## Project Structure

```text
src/
├── config/
│   ├── database.config.js
│   └── env.config.js
├── constants/
│   └── index.js
├── controllers/
│   ├── products.controller.js
│   └── users.controller.js
├── models/
│   ├── product.model.js
│   └── user.model.js
├── repositories/
│   ├── products.repository.js
│   └── users.repository.js
├── routes/
│   ├── products.routes.js
│   └── users.routes.js
├── services/
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

## Domain Constants

Application roles and product statuses are centralized as immutable constants.

User roles:

```text
ADMIN
USER
```

Product statuses:

```text
AVAILABLE
OUT_OF_STOCK
```

This avoids scattering magic strings throughout the application.

## Error Handling

The API uses centralized error handling and returns appropriate HTTP status codes.

Examples:

```text
400 Bad Request   → Invalid product data
404 Not Found     → Product or user does not exist
409 Conflict      → Email already registered
500 Internal Server Error → Unexpected server error
```

## Service vs Repository

The Service and Repository layers have intentionally different responsibilities.

The **Service layer** answers:

> What business rules should the application enforce?

For example, a product with zero stock becomes unavailable, and two users cannot register the same email address.

The **Repository layer** answers:

> How should the application read or write this data?

For example, it performs Mongoose queries, applies database filters and projections, sorts results, and persists updates.

This separation keeps business rules independent from the database implementation and makes the codebase easier to maintain, test, and extend.
