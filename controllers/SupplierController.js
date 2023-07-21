import SupplierModel from "../models/SupplierModel.js";
import path from "path";
import fs from "fs";
import { showErrorMessage } from "../utils/Helper.js";
import { Sequelize, Op } from "sequelize";

export const getSuppliers = async (req, res) => {
  try {
    const searchedText = req.query.searchedText || "";
    const response = await SupplierModel.findAll({
      attributes: [
        "id",
        "name",
        "phone",
        "image",
        [Sequelize.literal(`concat('${process.env.BASE_URL}',url)`), "url"],
      ],
      where: {
        name: { [Op.like]: `%${searchedText}%` },
      },
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailSupplier = async (req, res) => {
  try {
    const response = await SupplierModel.findOne({
      attributes: [
        "id",
        "name",
        "phone",
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

export const addSupplier = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  if (req.files == null)
    return res.status(400).json({ message: "No file uploaded" });

  const { name, phone } = req.body;
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
      await SupplierModel.create({
        name,
        phone,
        image: fileName,
        url: url,
        id_user: req.userId,
      });

      res.status(200).json({ message: "Supplier created successfully" });
    } catch (error) {
      showErrorMessage(res, error);
    }
  });
};

export const editSupplier = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  const supplier = await SupplierModel.findOne({
    where: {
      id: req.body.id,
    },
  });
  if (!supplier) return res.status(404).json({ message: "Supplier not found" });
  let fileName = "";
  if (req.files === null) {
    fileName = supplier.image;
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

    const filePath = `./public/images/${supplier.image}`;
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

    await SupplierModel.update(
      {
        name: req.body.name,
        phone: req.body.phone,
        image: fileName,
        url: url,
        id_user: req.userId,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.status(200).json({ message: "Supplier updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deleteSupplier = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  const supplier = await SupplierModel.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!supplier) return res.status(404).json({ message: "Supplier not found" });
  try {
    const filePath = `./public/images/${supplier.image}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await SupplierModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
