import express from "express";
import {
  addPersonalDebtPayment,
  deletePersonalDebtPayment,
  editPersonalDebtPayment,
  getDetailPersonalDebtPayment,
  getPersonalDebtPayments,
} from "../controllers/PersonalDebtPaymentController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/personal-debt-payments", VerifyToken, getPersonalDebtPayments);
router.get(
  "/personal-debt-payments/:id",
  VerifyToken,
  getDetailPersonalDebtPayment
);
router.post("/personal-debt-payments", VerifyToken, addPersonalDebtPayment);
router.patch("/personal-debt-payments", VerifyToken, editPersonalDebtPayment);
router.delete(
  "/personal-debt-payments/:id",
  VerifyToken,
  deletePersonalDebtPayment
);

export default router;
