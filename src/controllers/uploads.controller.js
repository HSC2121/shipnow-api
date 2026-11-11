
import { UploadsService } from "../services/uploads.service.js";

const uploadsService = new UploadsService();

export class UploadsController {
  async uploadUserDocument(req, res, next) {
    try {
      const user = await uploadsService.uploadUserDocument(
        req.params.id,
        req.file,
        req.body?.documentType
      );

      return res.status(201).json({
        status: "success",
        message: "User document uploaded successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadOrderProof(req, res, next) {
    try {
      const order = await uploadsService.uploadOrderProof(
        req.params.id,
        req.file
      );

      return res.status(201).json({
        status: "success",
        message: "Delivery proof uploaded successfully",
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadDriverLicense(req, res, next) {
    try {
      const driver = await uploadsService.uploadDriverLicense(
        req.params.id,
        req.file
      );

      return res.status(201).json({
        status: "success",
        message: "Driver license uploaded successfully",
        data: driver,
      });
    } catch (error) {
      next(error);
    }
  }
}
