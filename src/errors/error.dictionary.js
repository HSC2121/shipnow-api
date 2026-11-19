
export const ERROR_DICTIONARY = Object.freeze({
  INVALID_USER_DATA: {
    errorCode: "INVALID_USER_DATA",
    statusCode: 400,
    message: "First name, last name, and email are required",
  },

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

  ORDER_NOT_FOUND: {
    errorCode: "ORDER_NOT_FOUND",
    statusCode: 404,
    message: "Order not found",
  },

  INVALID_ORDER_DATA: {
    errorCode: "INVALID_ORDER_DATA",
    statusCode: 400,
    message: "Valid user, total, and delivery address are required",
  },

  INVALID_ORDER_STATUS: {
    errorCode: "INVALID_ORDER_STATUS",
    statusCode: 400,
    message: "Invalid order status",
  },

  INVALID_ORDER_TRANSITION: {
    errorCode: "INVALID_ORDER_TRANSITION",
    statusCode: 409,
    message: "Invalid order status transition",
  },

  ROUTE_NOT_FOUND: {
    errorCode: "ROUTE_NOT_FOUND",
    statusCode: 404,
    message: "Route not found",
  },

  FILE_REQUIRED: {
    errorCode: "FILE_REQUIRED",
    statusCode: 400,
    message: "A file is required",
  },

  INVALID_FILE_TYPE: {
    errorCode: "INVALID_FILE_TYPE",
    statusCode: 400,
    message: "Invalid file type",
  },

  FILE_TOO_LARGE: {
    errorCode: "FILE_TOO_LARGE",
    statusCode: 413,
    message: "File exceeds the 5 MB limit",
  },

  INVALID_FILE_FIELD: {
    errorCode: "INVALID_FILE_FIELD",
    statusCode: 400,
    message: "Unexpected file field",
  },

  INVALID_DOCUMENT_TYPE: {
    errorCode: "INVALID_DOCUMENT_TYPE",
    statusCode: 400,
    message: "Invalid document type",
  },

  DRIVER_NOT_FOUND: {
    errorCode: "DRIVER_NOT_FOUND",
    statusCode: 404,
    message: "Driver not found",
  },

  FILE_SAVE_FAILED: {
    errorCode: "FILE_SAVE_FAILED",
    statusCode: 500,
    message: "Failed to save uploaded file",
  },

  INVALID_PAGINATION: {
    errorCode: "INVALID_PAGINATION",
    statusCode: 400,
    message: "Pagination parameters must be positive integers and limit cannot exceed 100",
  },

  DELIVERY_NOT_FOUND: {
    errorCode: "DELIVERY_NOT_FOUND",
    statusCode: 404,
    message: "Delivery not found",
  },

  INVALID_DELIVERY_DATA: {
    errorCode: "INVALID_DELIVERY_DATA",
    statusCode: 400,
    message: "Valid order and estimated delivery date are required",
  },

  DELIVERY_ALREADY_EXISTS: {
    errorCode: "DELIVERY_ALREADY_EXISTS",
    statusCode: 409,
    message: "A delivery already exists for this order",
  },

  INVALID_DELIVERY_STATUS: {
    errorCode: "INVALID_DELIVERY_STATUS",
    statusCode: 400,
    message: "Invalid delivery status",
  },

  INVALID_DELIVERY_TRANSITION: {
    errorCode: "INVALID_DELIVERY_TRANSITION",
    statusCode: 409,
    message: "Invalid delivery status transition",
  },

  DRIVER_REQUIRED: {
    errorCode: "DRIVER_REQUIRED",
    statusCode: 400,
    message: "A valid driver must be assigned before dispatch",
  },

  INVALID_TRACKING_NOTE: {
    errorCode: "INVALID_TRACKING_NOTE",
    statusCode: 400,
    message: "Tracking note must be a string of at most 500 characters",
  },
});
