import UserModel from "../models/UserModel.js";
import bycrypt from "bcrypt";
import { Op, Sequelize } from "sequelize";
import { showErrorMessage } from "../utils/Helper.js";
import {
  handleImageError,
  removeImageSafely,
  saveImage,
} from "../utils/ImageStorage.js";

export const getUsers = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    const response = await UserModel.findAll({
      attributes: [
        "id",
        "name",
        "username",
        "image",
        [Sequelize.literal(`concat('${process.env.BASE_URL}',url)`), "url"],
      ],
      // where: { role: { [Op.ne]: "Superadmin" } },
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailUser = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    const response = await UserModel.findOne({
      attributes: [
        "id",
        "name",
        "username",
        "image",
        [Sequelize.literal(`concat('${process.env.BASE_URL}',url)`), "url"],
      ],
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addUser = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  if (!req.file)
    return res.status(400).json({ message: "No file uploaded" });

  const { name, username, password } = req.body;
  let storedImage;
  try {
    storedImage = await saveImage(req.file);
    const salt = await bycrypt.genSalt();
    const hash = await bycrypt.hash(password, salt);

    await UserModel.create({
      name,
      username,
      password: hash,
      image: storedImage.fileName,
      url: storedImage.url,
    });

    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    if (storedImage) await removeImageSafely(storedImage.fileName);
    if (!handleImageError(res, error)) showErrorMessage(res, error);
  }
};

export const editUser = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  const user = await UserModel.findOne({
    where: {
      id: req.body.id,
    },
  });
  if (!user) return res.status(404).json({ message: "User not found" });
  let storedImage;
  try {
    let patchData = {};
    if (req.body.password) {
      const salt = await bycrypt.genSalt();
      const hash = await bycrypt.hash(req.body.password, salt);
      patchData = {
        password: hash,
      };
    } else {
      storedImage = await saveImage(req.file);
      patchData = {
        name: req.body.name,
        username: req.body.username,
        ...(storedImage && {
          image: storedImage.fileName,
          url: storedImage.url,
        }),
      };
    }

    await UserModel.update(patchData, {
      where: {
        id: req.body.id,
      },
    });
    if (storedImage) await removeImageSafely(user.image);
    res.status(200).json({ message: "User updated" });
  } catch (error) {
    if (storedImage) await removeImageSafely(storedImage.fileName);
    if (!handleImageError(res, error)) showErrorMessage(res, error);
  }
};

export const deleteUser = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  const user = await UserModel.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!user) return res.status(404).json({ message: "User not found" });
  try {
    await UserModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    await removeImageSafely(user.image);
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
