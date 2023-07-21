import express from "express";
import {
  addPersonalSavingTaking,
  deletePersonalSavingTaking,
  editPersonalSavingTaking,
  getDetailPersonalSavingTaking,
  getPersonalSavingTakings,
} from "../controllers/PersonalSavingTakingController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";

const router = express.Router();

router.get("/personal-saving-takings", VerifyToken, getPersonalSavingTakings);
router.get(
  "/personal-saving-takings/:id",
  VerifyToken,
  getDetailPersonalSavingTaking
);
router.post("/personal-saving-takings", VerifyToken, addPersonalSavingTaking);
router.patch("/personal-saving-takings", VerifyToken, editPersonalSavingTaking);
router.delete(
  "/personal-saving-takings/:id",
  VerifyToken,
  deletePersonalSavingTaking
);

export default router;
