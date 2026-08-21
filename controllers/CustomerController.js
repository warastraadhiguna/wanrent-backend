import CustomerModel from "../models/CustomerModel.js";
import { showErrorMessage } from "../utils/Helper.js";
import { Sequelize, Op } from "sequelize";
import {
  handleImageError,
  removeImageSafely,
  saveImage,
} from "../utils/ImageStorage.js";

export const getCustomers = async (req, res) => {
  try {
    const searchedText = req.query.searchedText || "";
    const response = await CustomerModel.findAll({
      attributes: [
        "id",
        "name",
        "phone",
        "note",
        "image",
        [Sequelize.literal(`concat('${process.env.BASE_URL}',url)`), "url"],
      ],
      where: {
        name: { [Op.like]: `%${searchedText}%` },
      },
      order: [["name", "asc"]],
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailCustomer = async (req, res) => {
  try {
    const response = await CustomerModel.findOne({
      attributes: [
        "id",
        "name",
        "phone",
        "note",
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

export const addCustomer = async (req, res) => {
  const { name, phone, note } = req.body;
  let storedImage;
  try {
    storedImage = await saveImage(req.file);
    await CustomerModel.create({
      name,
      phone,
      note,
      ...(storedImage && {
        image: storedImage.fileName,
        url: storedImage.url,
      }),
      id_user: req.userId,
    });

    res.status(200).json({ message: "Customer created successfully" });
  } catch (error) {
    if (storedImage) await removeImageSafely(storedImage.fileName);
    if (!handleImageError(res, error)) showErrorMessage(res, error);
  }
};

export const editCustomer = async (req, res) => {
  const customer = await CustomerModel.findOne({
    where: {
      id: req.body.id,
    },
  });
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  let storedImage;
  try {
    storedImage = await saveImage(req.file);
    const updatedField = {
      name: req.body.name,
      phone: req.body.phone,
      note: req.body.note,
      id_user: req.userId,
      ...(storedImage && {
        image: storedImage.fileName,
        url: storedImage.url,
      }),
    };
    await CustomerModel.update(updatedField, {
      where: {
        id: req.body.id,
      },
    });
    if (storedImage) await removeImageSafely(customer.image);
    res.status(200).json({ message: "Customer updated" });
  } catch (error) {
    if (storedImage) await removeImageSafely(storedImage.fileName);
    if (!handleImageError(res, error)) showErrorMessage(res, error);
  }
};

export const deleteCustomer = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  const customer = await CustomerModel.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!customer) return res.status(404).json({ message: "Customer not found" });
  try {
    await CustomerModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    await removeImageSafely(customer.image);
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
