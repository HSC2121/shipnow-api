
import { DeliveriesService } from "../services/deliveries.service.js";

const deliveriesService = new DeliveriesService();

export class DeliveriesController {
  async getDeliveries(req, res, next) {
    try {
      const { deliveries, pagination } =
        await deliveriesService.getDeliveries(req.query);

      res.status(200).json({
        status: "success",
        data: deliveries,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDeliveryById(req, res, next) {
    try {
      const delivery =
        await deliveriesService.getDeliveryById(
          req.params.id
        );

      res.status(200).json({
        status: "success",
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async createDelivery(req, res, next) {
    try {
      const delivery =
        await deliveriesService.createDelivery(req.body);

      res.status(201).json({
        status: "success",
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async assignDriver(req, res, next) {
    try {
      const delivery =
        await deliveriesService.assignDriver(
          req.params.id,
          req.body?.driver
        );

      res.status(200).json({
        status: "success",
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateDeliveryStatus(req, res, next) {
    try {
      const delivery =
        await deliveriesService.updateDeliveryStatus(
          req.params.id,
          req.body?.status,
          req.body?.note ?? ""
        );

      res.status(200).json({
        status: "success",
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrackingHistory(req, res, next) {
    try {
      const tracking =
        await deliveriesService.getTrackingHistory(
          req.params.id
        );

      res.status(200).json({
        status: "success",
        data: tracking,
      });
    } catch (error) {
      next(error);
    }
  }
}
