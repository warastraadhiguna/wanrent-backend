import express from "express";
import {
  addTransaction,
  deleteTransaction,
  editTransaction,
  endTransaction,
  getActiveTransactions,
  getDetailTransaction,
  getDetailActiveTransaction,
  getDetailTransactionByCode,
  getTransactions,
  getDetailTransactionByRFID,
  getDetailTransactionByPlate,
} from "../controllers/TransactionController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/transactions", VerifyToken, getTransactions);
router.get("/active-transactions", getActiveTransactions);
router.get("/transactions/:id", VerifyToken, getDetailActiveTransaction);
router.get("/detail-transactions/:id", VerifyToken, getDetailTransaction);
router.get(
  "/transactions-by-code/:code",
  VerifyToken,
  getDetailTransactionByCode
);
router.get(
  "/transactions-by-rfid/:rfid",
  VerifyToken,
  getDetailTransactionByRFID
);
router.get("/transactions-by-plate", getDetailTransactionByPlate);
router.post("/transactions", VerifyToken, addTransaction);
router.patch("/transactions", VerifyToken, editTransaction);
router.patch("/end-transactions", VerifyToken, endTransaction);
router.delete("/transactions/:id", VerifyToken, deleteTransaction);

export default router;
