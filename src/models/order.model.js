
import mongoose from "mongoose";
import {
  ORDER_STATUS,
  ORDER_PRIORITY
} from "../constants/index.js";
import { fileMetadataSchema } from "./file-metadata.schema.js";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING
    },

    priority: {
      type: String,
      enum: Object.values(ORDER_PRIORITY),
      default: ORDER_PRIORITY.NORMAL
    },

    deliveryAddress: {
      type: String,
      required: true,
      trim: true
    },

    deliveryProofs: {
      type: [fileMetadataSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const OrderModel = mongoose.model(
  "Order",
  orderSchema
);
