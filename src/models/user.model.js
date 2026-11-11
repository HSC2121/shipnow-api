
import mongoose from "mongoose";
import { USER_ROLES } from "../constants/index.js";
import { fileMetadataSchema } from "./file-metadata.schema.js";

const userSchema = new mongoose.Schema(
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
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER
    },

    documents: {
      type: [fileMetadataSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.model(
  "User",
  userSchema
);
