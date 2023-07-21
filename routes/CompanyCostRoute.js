import express from "express";
import {
  addCompanyCost,
  deleteCompanyCost,
  editCompanyCost,
  getDetailCompanyCost,
  getCompanyCosts,
} from "../controllers/CompanyCostController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/company-costs", VerifyToken, getCompanyCosts);
router.get("/company-costs/:id", VerifyToken, getDetailCompanyCost);
router.post("/company-costs", VerifyToken, addCompanyCost);
router.patch("/company-costs", VerifyToken, editCompanyCost);
router.delete("/company-costs/:id", VerifyToken, deleteCompanyCost);

export default router;
