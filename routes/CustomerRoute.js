import express from "express";
import {
  addCustomer,
  deleteCustomer,
  editCustomer,
  getDetailCustomer,
  getCustomers,
} from "../controllers/CustomerController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";
import { uploadImage } from "../middlewares/ImageUpload.js";

const router = express.Router();

router.get("/customers", VerifyToken, getCustomers);
router.get("/customers/:id", VerifyToken, getDetailCustomer);
router.post("/customers", VerifyToken, uploadImage, addCustomer);
router.patch("/customers", VerifyToken, uploadImage, editCustomer);
router.delete("/customers/:id", VerifyToken, deleteCustomer);

export default router;
