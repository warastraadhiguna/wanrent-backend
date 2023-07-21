import express from "express";
import {
  addBrand,
  deleteBrand,
  editBrand,
  getDetailBrand,
  getBrands,
} from "../controllers/BrandController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/brands", VerifyToken, getBrands);
router.get("/brands/:id", VerifyToken, getDetailBrand);
router.post("/brands", VerifyToken, addBrand);
router.patch("/brands", VerifyToken, editBrand);
router.delete("/brands/:id", VerifyToken, deleteBrand);

export default router;
