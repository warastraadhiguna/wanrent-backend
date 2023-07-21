import express from "express";
import { login, logout, refreshToken } from "../controllers/AuthController.js";

const router = express.Router();

router.post("/login", login);
router.get("/token", refreshToken);
router.delete("/logout", logout);

export default router;
