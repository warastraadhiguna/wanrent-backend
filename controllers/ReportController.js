import {
  getReportBySupplierService,
  getReportByOwnershipService,
} from "../models/ReportModel.js";
import { showErrorMessage } from "../utils/Helper.js";

export const getReportBySupplier = async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const response = await getReportBySupplierService(startDate, endDate);

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getReportByOwnership = async (req, res) => {
  try {
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const response = await getReportByOwnershipService(startDate, endDate);

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
