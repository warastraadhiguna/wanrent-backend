import OrderModel from "../models/OrderModel.js";
import CustomerModel from "../models/CustomerModel.js";
import UserModel from "../models/UserModel.js";
import TypeModel from "../models/TypeModel.js";
import { Op, Sequelize } from "sequelize";
import { showErrorMessage } from "../utils/Helper.js";

OrderModel.belongsTo(CustomerModel, {
  foreignKey: "id_customer",
});
OrderModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});

export const getOrders = async (req, res) => {
  try {
    const searchedText = req.query.searchedText || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const response = await OrderModel.findAll({
      include: [
        {
          model: CustomerModel,
          attributes: [
            "id",
            "name",
            "phone",
            [
              Sequelize.literal(
                `concat('${process.env.BASE_URL}',customer.url)`
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
      attributes: ["id", "id_user", "id_customer", "note", "order_date"],
      where: {
        [Op.and]: [
          {
            "$customer.name$": {
              [Op.like]: `%${searchedText}%`,
            },
          },
          {
            order_date: {
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

export const getDetailOrder = async (req, res) => {
  try {
    const response = await OrderModel.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addOrder = async (req, res) => {
  try {
    const { customer, note, order_date } = req.body;
    await OrderModel.create({
      id_customer: customer.id,
      note,
      order_date,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Order created successfully" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editOrder = async (req, res) => {
  try {
    await OrderModel.update(
      {
        note: req.body.note,
        id_customer: req.body.id_customer,
        order_date: req.body.order_date,
        id_user: req.userId,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.status(200).json({ message: "Order updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deleteOrder = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await OrderModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
