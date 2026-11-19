
import mongoose from "mongoose";
import { DELIVERY_STATUS } from "../constants/index.js";

const trackingEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },

    status: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.PENDING,
    },

    estimatedDeliveryDate: {
      type: Date,
      required: true,
    },

    trackingHistory: {
      type: [trackingEventSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// An order can have only one delivery.
// MongoDB enforces this even under concurrent requests.
deliverySchema.index(
  { order: 1 },
  { unique: true }
);

// Optimize paginated delivery listings.
deliverySchema.index({
  createdAt: -1,
  _id: -1,
});

export const DeliveryModel = mongoose.model(
  "Delivery",
  deliverySchema
);
