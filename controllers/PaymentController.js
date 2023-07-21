import PaymentModel from "../models/PaymentModel.js";
import UserModel from "../models/UserModel.js";
import TransactionModel from "../models/TransactionModel.js";
import { showErrorMessage } from "../utils/Helper.js";
import db from "../configs/Database.js";
import moment from "moment";

PaymentModel.belongsTo(TransactionModel, {
  foreignKey: "id_transaction",
});
PaymentModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});

export const getPayments = async (req, res) => {
  try {
    const id_transaction = req.query.id_transaction;

    const where = id_transaction
      ? {
          id_transaction,
        }
      : {};
    const response = await PaymentModel.findAll({
      where,
      include: [
        {
          model: TransactionModel,
          attributes: [],
        },
        {
          model: UserModel,
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "id_transaction", "id_user", "total", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailPayment = async (req, res) => {
  try {
    const response = await PaymentModel.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "id_transaction", "time", "payment"],
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addPayment = async (req, res) => {
  try {
    const { idTransaction, total, unpaid } = req.body;
    await PaymentModel.create({
      id_transaction: idTransaction,
      total,
      id_user: req.userId,
    });

    if (unpaid.toString() === total.toString()) {
      res.status(200).json({ message: "Payment success" });
    } else res.status(200).json({ message: "" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editPayment = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { idPayment, total, currentTotal } = req.body;
    const payment = await PaymentModel.findOne({
      where: {
        id: idPayment,
      },
    });

    const lastMonthNewDate = moment(new Date())
      .subtract(1, "months")
      .format("YYYY/MM");
    console.log("asdf", lastMonthNewDate.toString() + "/15");
    await PaymentModel.update(
      {
        createdAt: lastMonthNewDate.toString() + "/15",
        total,
        id_user: req.userId,
      },
      {
        where: {
          id: idPayment,
        },
      }
    );

    await PaymentModel.create({
      id_transaction: payment.id_transaction,
      total: currentTotal - total,
      id_user: req.userId,
    });

    await transaction.commit();
    res.status(200).json({ message: "Payment updated" });
  } catch (error) {
    await transaction.rollback();
    showErrorMessage(res, error);
  }
};

export const deletePayment = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await PaymentModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
