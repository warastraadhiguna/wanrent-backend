import express from "express";
import {
  addCustomer,
  deleteCustomer,
  editCustomer,
  getDetailCustomer,
  getCustomers,
} from "../controllers/CustomerController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/customers", VerifyToken, getCustomers);
router.get("/customers/:id", VerifyToken, getDetailCustomer);
router.post("/customers", VerifyToken, addCustomer);
router.patch("/customers", VerifyToken, editCustomer);
router.delete("/customers/:id", VerifyToken, deleteCustomer);

export default router;
