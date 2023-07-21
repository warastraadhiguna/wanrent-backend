import PersonalCostModel from "../models/PersonalCostModel.js";
import UserModel from "../models/UserModel.js";
import SupplierModel from "../models/SupplierModel.js";
import { Op, Sequelize } from "sequelize";
import { showErrorMessage } from "../utils/Helper.js";

PersonalCostModel.belongsTo(SupplierModel, {
  foreignKey: "id_supplier",
});
PersonalCostModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});

export const getPersonalCosts = async (req, res) => {
  try {
    const searchedText = req.query.searchedText || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const response = await PersonalCostModel.findAll({
      include: [
        {
          model: SupplierModel,
          attributes: [
            "id",
            "name",
            "phone",
            [
              Sequelize.literal(
                `concat('${process.env.BASE_URL}',supplier.url)`
              ),
              "url",
            ],
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
        "id_supplier",
        "total",
        "note",
        "personal_cost_date",
      ],
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { $note$: { [Op.like]: `%${searchedText}%` } },
              {
                "$supplier.name$": {
                  [Op.like]: `%${searchedText}%`,
                },
              },
            ],
          },
          {
            personal_cost_date: {
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

export const getDetailPersonalCost = async (req, res) => {
  try {
    const response = await PersonalCostModel.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addPersonalCost = async (req, res) => {
  try {
    const { id_supplier, total, note, personal_cost_date } = req.body;

    await PersonalCostModel.create({
      id_supplier,
      total,
      note,
      personal_cost_date,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Personal Cost created successfully" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editPersonalCost = async (req, res) => {
  try {
    await PersonalCostModel.update(
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
    res.status(200).json({ message: "PersonalCost updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deletePersonalCost = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await PersonalCostModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
