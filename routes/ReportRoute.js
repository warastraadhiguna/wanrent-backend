import express from "express";
import {
  getReportByOwnership,
  getReportBySupplier,
} from "../controllers/ReportController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/report-by-supplier", VerifyToken, getReportBySupplier);
router.get("/report-by-ownership", VerifyToken, getReportByOwnership);
export default router;
