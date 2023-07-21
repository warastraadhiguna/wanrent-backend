import PersonalDebtPaymentModel from "../models/PersonalDebtPaymentModel.js";
import UserModel from "../models/UserModel.js";
import PersonalDebtModel from "../models/PersonalDebtModel.js";
import SupplierModel from "../models/SupplierModel.js";
import { showErrorMessage } from "../utils/Helper.js";
import db from "../configs/Database.js";
import moment from "moment";
import { Op, Sequelize } from "sequelize";

PersonalDebtPaymentModel.belongsTo(PersonalDebtModel, {
  foreignKey: "id_personal_debt",
});
PersonalDebtPaymentModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});
PersonalDebtModel.belongsTo(SupplierModel, {
  foreignKey: "id_supplier",
});
PersonalDebtModel.hasMany(PersonalDebtPaymentModel, {
  foreignKey: "id_personal_debt",
});
PersonalDebtModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});

export const getPersonalDebtPayments = async (req, res) => {
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
          attributes: ["id", "name"],
        },
        {
          model: PersonalDebtPaymentModel,
          attributes: ["id", "total", "createdAt"],
        },
      ],
      attributes: ["id"],
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
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailPersonalDebtPayment = async (req, res) => {
  try {
    const response = await PersonalDebtPaymentModel.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "id_personal_debt", "time", "personalDebtPayment"],
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addPersonalDebtPayment = async (req, res) => {
  try {
    const { idPersonalDebt, total, unpaid } = req.body;
    await PersonalDebtPaymentModel.create({
      id_personal_debt: idPersonalDebt,
      total,
      id_user: req.userId,
    });

    if (unpaid.toString() === total.toString()) {
      res.status(200).json({ message: "Personal Debt Payment success" });
    } else res.status(200).json({ message: "" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editPersonalDebtPayment = async (req, res) => {
  const personalDebt = await db.personalDebt();
  try {
    const { idPersonalDebtPayment, total, currentTotal } = req.body;
    const personalDebtPayment = await PersonalDebtPaymentModel.findOne({
      where: {
        id: idPersonalDebtPayment,
      },
    });

    const lastMonthNewDate = moment(new Date())
      .subtract(1, "months")
      .format("YYYY/MM");

    await PersonalDebtPaymentModel.update(
      {
        createdAt: lastMonthNewDate.toString() + "/15",
        total,
        id_user: req.userId,
      },
      {
        where: {
          id: idPersonalDebtPayment,
        },
      }
    );

    await PersonalDebtPaymentModel.create({
      id_personal_debt: personalDebtPayment.id_personal_debt,
      total: currentTotal - total,
      id_user: req.userId,
    });

    await personalDebt.commit();
    res.status(200).json({ message: "Personal Debt Payment updated" });
  } catch (error) {
    await personalDebt.rollback();
    showErrorMessage(res, error);
  }
};

export const deletePersonalDebtPayment = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await PersonalDebtPaymentModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
