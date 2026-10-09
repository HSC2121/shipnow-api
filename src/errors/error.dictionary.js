export const ERROR_DICTIONARY = Object.freeze({
  USER_NOT_FOUND: {
    errorCode: "USER_NOT_FOUND",
    statusCode: 404,
    message: "User not found",
  },

  EMAIL_ALREADY_REGISTERED: {
    errorCode: "EMAIL_ALREADY_REGISTERED",
    statusCode: 409,
    message: "Email already registered",
  },

  PRODUCT_NOT_FOUND: {
    errorCode: "PRODUCT_NOT_FOUND",
    statusCode: 404,
    message: "Product not found",
  },

  INVALID_ID: {
    errorCode: "INVALID_ID",
    statusCode: 400,
    message: "Invalid resource ID",
  },

  INVALID_PRICE: {
    errorCode: "INVALID_PRICE",
    statusCode: 400,
    message: "Price cannot be negative",
  },

  INVALID_STOCK: {
    errorCode: "INVALID_STOCK",
    statusCode: 400,
    message: "Stock cannot be negative",
  },

  INVALID_MOCK_QUANTITY: {
    errorCode: "INVALID_MOCK_QUANTITY",
    statusCode: 400,
    message: "Quantity must be an integer between 1 and 100",
  },

  MOCK_SEED_FAILED: {
    errorCode: "MOCK_SEED_FAILED",
    statusCode: 500,
    message: "Failed to seed mock data",
  },

  ROUTE_NOT_FOUND: {
    errorCode: "ROUTE_NOT_FOUND",
    statusCode: 404,
    message: "Route not found",
  },
});
