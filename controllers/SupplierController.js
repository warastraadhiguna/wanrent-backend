import SupplierModel from "../models/SupplierModel.js";
import { showErrorMessage } from "../utils/Helper.js";
import { Sequelize, Op } from "sequelize";
import {
  handleImageError,
  removeImageSafely,
  saveImage,
} from "../utils/ImageStorage.js";

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

  if (!req.file)
    return res.status(400).json({ message: "No file uploaded" });

  const { name, phone } = req.body;
  let storedImage;
  try {
    storedImage = await saveImage(req.file);
    await SupplierModel.create({
      name,
      phone,
      image: storedImage.fileName,
      url: storedImage.url,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Supplier created successfully" });
  } catch (error) {
    if (storedImage) await removeImageSafely(storedImage.fileName);
    if (!handleImageError(res, error)) showErrorMessage(res, error);
  }
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
  let storedImage;
  try {
    storedImage = await saveImage(req.file);

    await SupplierModel.update(
      {
        name: req.body.name,
        phone: req.body.phone,
        ...(storedImage && {
          image: storedImage.fileName,
          url: storedImage.url,
        }),
        id_user: req.userId,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    if (storedImage) await removeImageSafely(supplier.image);
    res.status(200).json({ message: "Supplier updated" });
  } catch (error) {
    if (storedImage) await removeImageSafely(storedImage.fileName);
    if (!handleImageError(res, error)) showErrorMessage(res, error);
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
    await SupplierModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    await removeImageSafely(supplier.image);
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
