import VehicleModel from "../models/VehicleModel.js";
import BrandModel from "../models/BrandModel.js";
import TypeModel from "../models/TypeModel.js";
import { showErrorMessage } from "../utils/Helper.js";

VehicleModel.belongsTo(BrandModel, {
  foreignKey: "id_brand",
});
VehicleModel.belongsTo(TypeModel, {
  foreignKey: "id_type",
});

export const getVehicles = async (req, res) => {
  try {
    const response = await VehicleModel.findAll({
      include: [
        {
          model: BrandModel,
          attributes: ["id", "name"],
        },
        {
          model: TypeModel,
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "id_brand", "id_type", "detail_type", "note"],
      order: [
        ["brand", "name", "ASC"],
        ["type", "name", "ASC"],
      ],
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailVehicle = async (req, res) => {
  try {
    const response = await VehicleModel.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "id_brand", "id_type", "detail_type", "note"],
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addVehicle = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    const { id_brand, id_type, detail_type, note } = req.body;
    await VehicleModel.create({
      id_brand,
      id_type,
      detail_type,
      note,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Vehicle created successfully" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editVehicle = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    const { id_brand, id_type, detail_type, note } = req.body;
    await VehicleModel.update(
      {
        id_brand,
        id_type,
        detail_type,
        note,
        id_user: req.userId,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.status(200).json({ message: "Vehicle updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deleteVehicle = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await VehicleModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
