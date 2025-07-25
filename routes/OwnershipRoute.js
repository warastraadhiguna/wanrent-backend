import express from "express";
import {
  addOwnership,
  deleteOwnership,
  editOwnership,
  getDetailOwnership,
  getOwnerships,
  getOwnershipTargetValues,
} from "../controllers/OwnershipController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/ownerships", VerifyToken, getOwnerships);
router.get("/ownerships/:id", VerifyToken, getDetailOwnership);
router.post("/ownerships", VerifyToken, addOwnership);
router.patch("/ownerships", VerifyToken, editOwnership);
router.delete("/ownerships/:id", VerifyToken, deleteOwnership);
router.get("/ownerships-target-values", VerifyToken, getOwnershipTargetValues);

export default router;
