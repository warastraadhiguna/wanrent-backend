import express from "express";
import { getDetailType, getTypes } from "../controllers/TypeController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/types", VerifyToken, getTypes);
router.get("/types/:id", VerifyToken, getDetailType);

export default router;
