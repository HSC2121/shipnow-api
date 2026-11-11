export const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
  DRIVER: "driver"
});

export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: "available",
  OUT_OF_STOCK: "out_of_stock"
});

export const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
});

export const ORDER_PRIORITY = Object.freeze({
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high"
});

export const DELIVERY_STATUS = Object.freeze({
  PENDING: "pending",
  ASSIGNED: "assigned",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered"
});

export const DOCUMENT_TYPES = Object.freeze({
  IDENTITY: "identity",
  PASSPORT: "passport",
  ADDRESS: "address",
  DELIVERY_PROOF: "delivery_proof",
  DRIVER_LICENSE: "driver_license",
});

export const ALLOWED_UPLOAD_MIME_TYPES = Object.freeze([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;