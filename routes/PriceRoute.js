import express from "express";
import {
  addPrice,
  deletePrice,
  editPrice,
  getDetailPrice,
  getPrices,
} from "../controllers/PriceController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/prices", VerifyToken, getPrices);
router.get("/prices/:id", VerifyToken, getDetailPrice);
router.post("/prices", VerifyToken, addPrice);
router.patch("/prices", VerifyToken, editPrice);
router.delete("/prices/:id", VerifyToken, deletePrice);

export default router;
