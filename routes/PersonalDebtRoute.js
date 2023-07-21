import express from "express";
import {
  addPersonalDebt,
  deletePersonalDebt,
  editPersonalDebt,
  getDetailPersonalDebt,
  getPersonalDebts,
} from "../controllers/PersonalDebtController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/personal-debts", VerifyToken, getPersonalDebts);
router.get("/personal-debts/:id", VerifyToken, getDetailPersonalDebt);
router.post("/personal-debts", VerifyToken, addPersonalDebt);
router.patch("/personal-debts", VerifyToken, editPersonalDebt);
router.delete("/personal-debts/:id", VerifyToken, deletePersonalDebt);

export default router;
