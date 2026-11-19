
import { DeliveryModel } from "../models/delivery.model.js";

export class DeliveriesRepository {
  async getAll({ skip, limit }) {
    const [deliveries, total] = await Promise.all([
      DeliveryModel.find()
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      DeliveryModel.countDocuments(),
    ]);

    return { deliveries, total };
  }

  async findById(id) {
    return DeliveryModel.findById(id);
  }

  async findByOrderId(orderId) {
    return DeliveryModel.findOne({ order: orderId });
  }

  async create(deliveryData) {
    return DeliveryModel.create(deliveryData);
  }

  // Assign drivers only while a delivery is pending or assigned.
  async assignDriverIfAllowed(id, driverId, allowedStatuses) {
    return DeliveryModel.findOneAndUpdate(
      {
        _id: id,
        status: { $in: allowedStatuses },
      },
      {
        $set: {
          driver: driverId,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );
  }

  // Atomically update status and append its tracking event.
  // The expected status prevents concurrent requests from
  // applying the same transition twice.
  async addTrackingEvent(
    id,
    expectedStatus,
    newStatus,
    note = ""
  ) {
    return DeliveryModel.findOneAndUpdate(
      {
        _id: id,
        status: expectedStatus,
        ...(newStatus === "assigned"
          ? { driver: { $ne: null } }
          : {}),
      },
      {
        $set: {
          status: newStatus,
        },
        $push: {
          trackingHistory: {
            status: newStatus,
            timestamp: new Date(),
            note,
          },
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    );
  }
}
