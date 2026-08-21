import express from "express";
import {
  addSupplier,
  deleteSupplier,
  editSupplier,
  getDetailSupplier,
  getSuppliers,
} from "../controllers/SupplierController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";
import { uploadImage } from "../middlewares/ImageUpload.js";

const router = express.Router();

router.get("/suppliers", VerifyToken, getSuppliers);
router.get("/suppliers/:id", VerifyToken, getDetailSupplier);
router.post("/suppliers", VerifyToken, uploadImage, addSupplier);
router.patch("/suppliers", VerifyToken, uploadImage, editSupplier);
router.delete("/suppliers/:id", VerifyToken, deleteSupplier);

export default router;
