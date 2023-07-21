import PriceModel from "../models/PriceModel.js";
import TypeModel from "../models/TypeModel.js";
import { showErrorMessage } from "../utils/Helper.js";

PriceModel.belongsTo(TypeModel, {
  foreignKey: "id_type",
});

export const getPrices = async (req, res) => {
  try {
    const response = await PriceModel.findAll({
      include: [
        {
          model: TypeModel,
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "id_type", "time", "price"],
      order: [
        ["type", "name", "ASC"],
        ["time", "ASC"],
      ],
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailPrice = async (req, res) => {
  try {
    const response = await PriceModel.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "id_type", "time", "price"],
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addPrice = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    const { id_type, time, price } = req.body;
    await PriceModel.create({
      id_type,
      time,
      price,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Price created successfully" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editPrice = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    const { id_type, time, price } = req.body;
    await PriceModel.update(
      {
        id_type,
        time,
        price,
        id_user: req.userId,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.status(200).json({ message: "Price updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deletePrice = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await PriceModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
