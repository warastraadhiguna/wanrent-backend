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
import { uploadImage } from "../middlewares/ImageUpload.js";

const router = express.Router();

router.get("/ownerships", VerifyToken, getOwnerships);
router.get("/ownerships/:id", VerifyToken, getDetailOwnership);
router.post("/ownerships", VerifyToken, uploadImage, addOwnership);
router.patch("/ownerships", VerifyToken, uploadImage, editOwnership);
router.delete("/ownerships/:id", VerifyToken, deleteOwnership);
router.get("/ownerships-target-values", VerifyToken, getOwnershipTargetValues);

export default router;
