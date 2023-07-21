import BrandModel from "../models/BrandModel.js";
import { showErrorMessage } from "../utils/Helper.js";

export const getBrands = async (req, res) => {
  try {
    const response = await BrandModel.findAll({
      attributes: ["id", "name"],
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailBrand = async (req, res) => {
  try {
    const response = await BrandModel.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addBrand = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    const { name } = req.body;
    await BrandModel.create({
      name,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Brand created successfully" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editBrand = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await BrandModel.update(
      {
        name: req.body.name,
        id_user: req.userId,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.status(200).json({ message: "Brand updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deleteBrand = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await BrandModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
