import express from "express";
import {
  addUser,
  deleteUser,
  editUser,
  getDetailUser,
  getUsers,
} from "../controllers/UserController.js";
import { VerifyToken } from "../middlewares/VerifyToken.js";
import { uploadImage } from "../middlewares/ImageUpload.js";

const router = express.Router();

router.get("/users", VerifyToken, getUsers);
router.get("/users/:id", VerifyToken, getDetailUser);
router.post("/users", VerifyToken, uploadImage, addUser);
router.patch("/users", VerifyToken, uploadImage, editUser);
router.delete("/users/:id", VerifyToken, deleteUser);

export default router;
