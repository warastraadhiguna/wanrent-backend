import UserModel from "../models/UserModel.js";
import bycrypt from "bcrypt";
import path from "path";
import fs from "fs";

import { Op, Sequelize } from "sequelize";
import { showErrorMessage } from "../utils/Helper.js";

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

  if (req.files == null)
    return res.status(400).json({ message: "No file uploaded" });

  const { name, username, password } = req.body;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `images/${fileName}`;
  const allowedType = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowedType.includes(file.mimetype))
    return res.status(422).json({ message: "Invalid file type" });

  if (fileSize > 5000000)
    return res.status(422).json({ message: "File size is too big > 5 MB" });

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading file" });
    }
    try {
      const salt = await bycrypt.genSalt();
      const hash = await bycrypt.hash(password, salt);

      await UserModel.create({
        name,
        username,
        password: hash,
        image: fileName,
        url: url,
      });

      res.status(200).json({ message: "User created successfully" });
    } catch (error) {
      showErrorMessage(res, error);
    }
  });
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
  let fileName = "";
  if (req.files === null) {
    fileName = user.image;
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = file.md5 + ext;
    const allowedType = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedType.includes(file.mimetype))
      return res.status(422).json({ message: "Invalid file type" });

    if (fileSize > 5000000)
      return res.status(422).json({ message: "File size is too big > 5 MB" });

    const filePath = `./public/images/${user.image}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error uploading file" });
      }
    });
  }

  try {
    const url = `images/${fileName}`;

    let patchData = {};
    if (req.body.password) {
      const salt = await bycrypt.genSalt();
      const hash = await bycrypt.hash(req.body.password, salt);
      req.body.password = hash;
      patchData = {
        password: hash,
      };
    } else {
      patchData = {
        name: req.body.name,
        username: req.body.username,
        image: fileName,
        url: url,
      };
    }

    await UserModel.update(patchData, {
      where: {
        id: req.body.id,
      },
    });
    res.status(200).json({ message: "User updated" });
  } catch (error) {
    showErrorMessage(res, error);
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
    const filePath = `./public/images/${user.image}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await UserModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
