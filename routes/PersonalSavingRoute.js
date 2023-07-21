import express from "express";
import {
  addPersonalSaving,
  deletePersonalSaving,
  editPersonalSaving,
  getDetailPersonalSaving,
  getPersonalSavings,
} from "../controllers/PersonalSavingController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/personal-savings", VerifyToken, getPersonalSavings);
router.get("/personal-savings/:id", VerifyToken, getDetailPersonalSaving);
router.post("/personal-savings", VerifyToken, addPersonalSaving);
router.patch("/personal-savings", VerifyToken, editPersonalSaving);
router.delete("/personal-savings/:id", VerifyToken, deletePersonalSaving);

export default router;
