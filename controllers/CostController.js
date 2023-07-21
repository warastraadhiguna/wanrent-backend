import CostModel from "../models/CostModel.js";
import OwnershipModel from "../models/OwnershipModel.js";
import UserModel from "../models/UserModel.js";
import SupplierModel from "../models/SupplierModel.js";
import VehicleModel from "../models/VehicleModel.js";
import BrandModel from "../models/BrandModel.js";
import TypeModel from "../models/TypeModel.js";
import { Op, Sequelize } from "sequelize";
import { showErrorMessage } from "../utils/Helper.js";

CostModel.belongsTo(OwnershipModel, {
  foreignKey: "id_ownership",
});
CostModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});

OwnershipModel.belongsTo(SupplierModel, {
  foreignKey: "id_supplier",
});
OwnershipModel.belongsTo(VehicleModel, {
  foreignKey: "id_vehicle",
});

VehicleModel.belongsTo(BrandModel, {
  foreignKey: "id_brand",
});
VehicleModel.belongsTo(TypeModel, {
  foreignKey: "id_type",
});

export const getCosts = async (req, res) => {
  try {
    const searchedText = req.query.searchedText || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const response = await CostModel.findAll({
      include: [
        {
          model: OwnershipModel,
          attributes: [
            "id",
            "code",
            "licence_plate",
            [
              Sequelize.literal(
                `concat('${process.env.BASE_URL}',ownership.url)`
              ),
              "url",
            ],
          ],
          include: [
            {
              model: SupplierModel,
              attributes: ["id", "name", "phone"],
            },
            {
              model: VehicleModel,
              attributes: ["id", "detail_type"],
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
            },
          ],
        },
        {
          model: UserModel,
          attributes: ["id", "name"],
        },
      ],
      attributes: [
        "id",
        "id_user",
        "id_ownership",
        "total",
        "note",
        "cost_date",
      ],
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { $code$: { [Op.like]: `%${searchedText}%` } },
              {
                "$ownership->supplier.name$": {
                  [Op.like]: `%${searchedText}%`,
                },
              },
            ],
          },
          {
            cost_date: {
              [Op.between]: [startDate + " 00:00:00", endDate + " 23:59:59"],
            },
          },
        ],
      },
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailCost = async (req, res) => {
  try {
    const response = await CostModel.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addCost = async (req, res) => {
  try {
    const { code, total, note, cost_date } = req.body;
    const ownership = await OwnershipModel.findOne({
      include: [
        {
          model: VehicleModel,
          attributes: ["id", "detail_type"],
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
        },
      ],
      where: {
        code: code,
      },
    });
    if (!ownership) return res.status(404).json({ message: "Unknown Code" });

    await CostModel.create({
      id_ownership: ownership.id,
      total,
      note,
      cost_date,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Cost created successfully" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editCost = async (req, res) => {
  try {
    await CostModel.update(
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
    res.status(200).json({ message: "Cost updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deleteCost = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await CostModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
