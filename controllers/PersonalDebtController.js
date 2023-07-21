import PersonalDebtModel from "../models/PersonalDebtModel.js";
import PersonalDebtPaymentModel from "../models/PersonalDebtPaymentModel.js";
import UserModel from "../models/UserModel.js";
import SupplierModel from "../models/SupplierModel.js";
import { Op, Sequelize } from "sequelize";
import { showErrorMessage } from "../utils/Helper.js";

PersonalDebtModel.hasMany(PersonalDebtPaymentModel, {
  foreignKey: "id_personal_debt",
});
PersonalDebtModel.belongsTo(SupplierModel, {
  foreignKey: "id_supplier",
});
PersonalDebtModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});

export const getPersonalDebts = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }
  try {
    const searchedText = req.query.searchedText || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const response = await PersonalDebtModel.findAll({
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
          model: PersonalDebtPaymentModel,
          attributes: ["total"],
        },
      ],
      attributes: [
        "id",
        "id_user",
        "id_supplier",
        "total",
        "note",
        "personal_debt_date",
        [
          Sequelize.fn("sum", Sequelize.col("personal_debt_payments.total")),
          "total_payments",
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
            personal_debt_date: {
              [Op.between]: [startDate + " 00:00:00", endDate + " 23:59:59"],
            },
          },
        ],
      },
      group: ["personal_debts.id"],
      order: [["personal_debt_date", "desc"]],
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailPersonalDebt = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }
  try {
    const response = await PersonalDebtModel.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addPersonalDebt = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }
  try {
    const { id_supplier, total, note, personal_debt_date } = req.body;

    await PersonalDebtModel.create({
      id_supplier,
      total,
      note,
      personal_debt_date,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Personal Debt created successfully" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editPersonalDebt = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }
  try {
    await PersonalDebtModel.update(
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
    res.status(200).json({ message: "PersonalDebt updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deletePersonalDebt = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await PersonalDebtModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
