import express from "express";
import {
  addPersonalCost,
  deletePersonalCost,
  editPersonalCost,
  getDetailPersonalCost,
  getPersonalCosts,
} from "../controllers/PersonalCostController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/personal-costs", VerifyToken, getPersonalCosts);
router.get("/personal-costs/:id", VerifyToken, getDetailPersonalCost);
router.post("/personal-costs", VerifyToken, addPersonalCost);
router.patch("/personal-costs", VerifyToken, editPersonalCost);
router.delete("/personal-costs/:id", VerifyToken, deletePersonalCost);

export default router;
