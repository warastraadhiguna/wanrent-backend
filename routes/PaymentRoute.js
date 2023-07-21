import express from "express";
import {
  addPayment,
  deletePayment,
  editPayment,
  getDetailPayment,
  getPayments,
} from "../controllers/PaymentController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/payments", VerifyToken, getPayments);
router.get("/payments/:id", VerifyToken, getDetailPayment);
router.post("/payments", VerifyToken, addPayment);
router.patch("/payments", VerifyToken, editPayment);
router.delete("/payments/:id", VerifyToken, deletePayment);

export default router;
