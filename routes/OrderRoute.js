import express from "express";
import {
  addOrder,
  deleteOrder,
  editOrder,
  getDetailOrder,
  getOrders,
} from "../controllers/OrderController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/orders", VerifyToken, getOrders);
router.get("/orders/:id", VerifyToken, getDetailOrder);
router.post("/orders", VerifyToken, addOrder);
router.patch("/orders", VerifyToken, editOrder);
router.delete("/orders/:id", VerifyToken, deleteOrder);

export default router;
