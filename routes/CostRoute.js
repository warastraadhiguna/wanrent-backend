import express from "express";
import {
  addCost,
  deleteCost,
  editCost,
  getDetailCost,
  getCosts,
} from "../controllers/CostController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/costs", VerifyToken, getCosts);
router.get("/costs/:id", VerifyToken, getDetailCost);
router.post("/costs", VerifyToken, addCost);
router.patch("/costs", VerifyToken, editCost);
router.delete("/costs/:id", VerifyToken, deleteCost);

export default router;
