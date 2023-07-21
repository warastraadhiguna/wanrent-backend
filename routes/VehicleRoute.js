import express from "express";
import {
  addVehicle,
  deleteVehicle,
  editVehicle,
  getDetailVehicle,
  getVehicles,
} from "../controllers/VehicleController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/vehicles", VerifyToken, getVehicles);
router.get("/vehicles/:id", VerifyToken, getDetailVehicle);
router.post("/vehicles", VerifyToken, addVehicle);
router.patch("/vehicles", VerifyToken, editVehicle);
router.delete("/vehicles/:id", VerifyToken, deleteVehicle);

export default router;
