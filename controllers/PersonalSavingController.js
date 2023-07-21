import PersonalSavingModel from "../models/PersonalSavingModel.js";
import PersonalSavingTakingModel from "../models/PersonalSavingTakingModel.js";
import UserModel from "../models/UserModel.js";
import SupplierModel from "../models/SupplierModel.js";
import { Op, Sequelize } from "sequelize";
import { showErrorMessage } from "../utils/Helper.js";

PersonalSavingModel.hasMany(PersonalSavingTakingModel, {
  foreignKey: "id_personal_saving",
});
PersonalSavingModel.belongsTo(SupplierModel, {
  foreignKey: "id_supplier",
});
PersonalSavingModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});

export const getPersonalSavings = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }
  try {
    const searchedText = req.query.searchedText || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const response = await PersonalSavingModel.findAll({
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
        {
          model: PersonalSavingTakingModel,
          attributes: ["total"],
        },
      ],
      attributes: [
        "id",
        "id_user",
        "id_supplier",
        "total",
        "note",
        "personal_saving_date",
        [
          Sequelize.fn("sum", Sequelize.col("personal_saving_takings.total")),
          "total_takings",
        ],
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
            personal_saving_date: {
              [Op.between]: [startDate + " 00:00:00", endDate + " 23:59:59"],
            },
          },
        ],
      },
      group: ["personal_savings.id"],
      order: [["personal_saving_date", "desc"]],
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailPersonalSaving = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }
  try {
    const response = await PersonalSavingModel.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addPersonalSaving = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }
  try {
    const { id_supplier, total, note, personal_saving_date } = req.body;

    await PersonalSavingModel.create({
      id_supplier,
      total,
      note,
      personal_saving_date,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Personal Saving created successfully" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editPersonalSaving = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }
  try {
    await PersonalSavingModel.update(
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
    res.status(200).json({ message: "PersonalSaving updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deletePersonalSaving = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await PersonalSavingModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
