import mongoose from "mongoose";
import { USER_ROLES } from "../constants/index.js";

const driverSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },

    role: {
      type: String,
      enum: [USER_ROLES.DRIVER],
      default: USER_ROLES.DRIVER
    },

    vehicle: {
      type: String,
      required: true,
      trim: true
    },

    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const DriverModel = mongoose.model(
  "Driver",
  driverSchema
);