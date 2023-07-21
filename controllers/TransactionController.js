import TransactionModel from "../models/TransactionModel.js";
import OwnershipModel from "../models/OwnershipModel.js";
import CustomerModel from "../models/CustomerModel.js";
import BrandModel from "../models/BrandModel.js";
import TypeModel from "../models/TypeModel.js";
import UserModel from "../models/UserModel.js";
import PriceModel from "../models/PriceModel.js";
import SupplierModel from "../models/SupplierModel.js";
import VehicleModel from "../models/VehicleModel.js";
import { numberWithCommas } from "../utils/Number.js";
import { showErrorMessage } from "../utils/Helper.js";
import { Op, Sequelize } from "sequelize";
import moment from "moment";
import db from "../configs/Database.js";
import PaymentModel from "../models/PaymentModel.js";

TransactionModel.hasMany(PaymentModel, { foreignKey: "id_transaction" });
TransactionModel.belongsTo(OwnershipModel, {
  foreignKey: "id_ownership",
});
TransactionModel.belongsTo(CustomerModel, {
  foreignKey: "id_customer",
});
TransactionModel.belongsTo(UserModel, {
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

export const getTransactions = async (req, res) => {
  try {
    const searchedText = req.query.searchedText || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const response = await TransactionModel.findAll({
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
        },
        {
          model: CustomerModel,
          attributes: ["id", "name"],
        },
        {
          model: PaymentModel,
          attributes: ["total"],
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
        "id_customer",
        "time_in",
        "time_out",
        "note",
        "total",
        [
          Sequelize.fn("sum", Sequelize.col("payments.total")),
          "total_payments",
        ],
        [
          Sequelize.literal(
            `case when time_out is null then '-' else concat(FLOOR(HOUR(TIMEDIFF(time_out, time_in)) / 24), ' days ', MOD(HOUR(TIMEDIFF(time_out, time_in)), 24), ' hours ', MINUTE(TIMEDIFF(time_out, time_in)), ' minutes') end`
          ),
          "totalTimeString",
        ],
      ],
      where: {
        [Op.and]: [
          { time_out: { [Op.ne]: null } },
          {
            [Op.or]: [
              { $code$: { [Op.like]: `%${searchedText}%` } },
              { "$customer.name$": { [Op.like]: `%${searchedText}%` } },
            ],
          },
          {
            time_in: {
              [Op.between]: [startDate + " 00:00:00", endDate + " 23:59:59"],
            },
          },
        ],
      },
      group: ["transactions.id"],
      order: [["time_in", "desc"]],
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getActiveTransactions = async (req, res) => {
  try {
    const response = await TransactionModel.findAll({
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
        },
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
          model: PaymentModel,
          attributes: ["id", "total", "createdAt"],
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
        "id_customer",
        "time_in",
        "time_out",
        "note",
        "total",
        [
          Sequelize.cast(
            Sequelize.fn("sum", Sequelize.col("payments.total")),
            "int"
          ),
          "total_payments",
        ],
        [
          Sequelize.literal(
            `case when time_out is null then '-' else concat(FLOOR(HOUR(TIMEDIFF(time_out, time_in)) / 24), ' days ', MOD(HOUR(TIMEDIFF(time_out, time_in)), 24), ' hours ', MINUTE(TIMEDIFF(time_out, time_in)), ' minutes') end`
          ),
          "totalTimeString",
        ],
      ],
      having: Sequelize.or(
        Sequelize.where(
          Sequelize.cast(
            Sequelize.fn("sum", Sequelize.col("payments.total")),
            "int"
          ),
          "<",
          Sequelize.col("total")
        ),
        Sequelize.where(
          Sequelize.cast(
            Sequelize.fn("sum", Sequelize.col("payments.total")),
            "int"
          ),
          "is",
          null
        ),
        Sequelize.where(Sequelize.col("total"), "=", 0)
      ),
      group: ["transactions.id"],
      order: [
        ["time_out", "asc"],
        ["time_in", "desc"],
      ],
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailActiveTransaction = async (req, res) => {
  try {
    // const response = await TransactionModel.findOne({
    //   where: {
    //     id: req.params.id,
    //   },
    //   include: [
    //     {
    //       model: OwnershipModel,
    //       attributes: [
    //         "id",
    //         "code",
    //         "licence_plate",
    //         [
    //           Sequelize.literal(
    //             `concat('${process.env.BASE_URL}',ownership.url)`
    //           ),
    //           "url",
    //         ],
    //       ],
    //       include: [
    //         {
    //           model: SupplierModel,
    //           attributes: ["id", "name", "phone"],
    //         },
    //         {
    //           model: VehicleModel,
    //           attributes: ["id", "detail_type"],
    //           include: [
    //             {
    //               model: BrandModel,
    //               attributes: ["id", "name"],
    //             },
    //             {
    //               model: TypeModel,
    //               attributes: ["id", "name"],
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //     {
    //       model: CustomerModel,
    //       attributes: ["id", "name"],
    //     },
    //     {
    //       model: UserModel,
    //       attributes: ["id", "name"],
    //     },
    //   ],
    //   attributes: [
    //     "id",
    //     "id_user",
    //     "id_ownership",
    //     "id_customer",
    //     "time_in",
    //     "time_out",
    //     "note",
    //     "total",
    //   ],
    // });

    const response = await TransactionModel.findAll({
      where: {
        id: req.params.id,
      },
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
          model: PaymentModel,
          attributes: ["id", "total", "createdAt"],
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
        "id_customer",
        "time_in",
        "time_out",
        "note",
        "total",
        [
          Sequelize.cast(
            Sequelize.fn("sum", Sequelize.col("payments.total")),
            "int"
          ),
          "total_payments",
        ],
        [
          Sequelize.literal(
            `case when time_out is null then '-' else concat(FLOOR(HOUR(TIMEDIFF(time_out, time_in)) / 24), ' days ', MOD(HOUR(TIMEDIFF(time_out, time_in)), 24), ' hours ', MINUTE(TIMEDIFF(time_out, time_in)), ' minutes') end`
          ),
          "totalTimeString",
        ],
      ],
      having: Sequelize.or(
        Sequelize.where(
          Sequelize.cast(
            Sequelize.fn("sum", Sequelize.col("payments.total")),
            "int"
          ),
          "<",
          Sequelize.col("total")
        ),
        Sequelize.where(
          Sequelize.cast(
            Sequelize.fn("sum", Sequelize.col("payments.total")),
            "int"
          ),
          "is",
          null
        ),
        Sequelize.where(Sequelize.col("total"), "=", 0)
      ),
      group: ["transactions.id"],
      order: [["time_in", "desc"]],
    });
    res.status(200).json({ data: response[0] });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailTransaction = async (req, res) => {
  try {
    const response = await TransactionModel.findAll({
      where: {
        id: req.params.id,
      },
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
          model: PaymentModel,
          attributes: ["id", "total", "createdAt"],
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
        "id_customer",
        "time_in",
        "time_out",
        "note",
        "total",
        [
          Sequelize.cast(
            Sequelize.fn("sum", Sequelize.col("payments.total")),
            "int"
          ),
          "total_payments",
        ],
        [
          Sequelize.literal(
            `case when time_out is null then '-' else concat(FLOOR(HOUR(TIMEDIFF(time_out, time_in)) / 24), ' days ', MOD(HOUR(TIMEDIFF(time_out, time_in)), 24), ' hours ', MINUTE(TIMEDIFF(time_out, time_in)), ' minutes') end`
          ),
          "totalTimeString",
        ],
      ],
      group: ["transactions.id"],
      order: [["time_in", "desc"]],
    });
    res.status(200).json({ data: response[0] });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailTransactionByCode = async (req, res) => {
  try {
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
        code: req.params.code,
      },
    });
    if (!ownership) return res.status(404).json({ message: "Unknown Code" });

    const transaction = await TransactionModel.findOne({
      where: {
        [Op.and]: [{ id_ownership: ownership.id }, { time_out: null }],
      },
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
      attributes: [
        "id",
        "id_user",
        "id_ownership",
        "id_customer",
        "time_in",
        "time_out",
        [Sequelize.literal("''"), "totalTimeString"],
        "note",
        "total",
        [Sequelize.literal("''"), "totalCalculated"],
      ],
    });
    if (!transaction)
      return res.status(404).json({ message: "The data is not available" });

    const prices = await PriceModel.findAll({
      where: {
        id_type: ownership.vehicle.type.dataValues.id,
      },
      attributes: ["id", "id_type", "time", "price"],
      order: [["time", "desc"]],
    });

    transaction.dataValues.time_out = new Date();
    const time_in = new Date(transaction.dataValues.time_in).getTime();
    const time_out = new Date(transaction.dataValues.time_out).getTime();
    const totalTime = Math.round((time_out - time_in) / 60000);
    const duration = moment.duration(totalTime, "minutes");
    transaction.dataValues.totalTimeString = `${duration.days()} days; ${duration.hours()} hours; ${duration.minutes()} minutes`;

    const upperLimit = 20; // minute, if more than upperLImit then totalTime + upperLimit
    let totalTimeModuloAnHour = totalTime % 60;
    let totalTimeCalculate =
      totalTime < upperLimit
        ? totalTime
        : totalTimeModuloAnHour < upperLimit
        ? totalTime - totalTimeModuloAnHour
        : totalTime + (60 - totalTimeModuloAnHour);

    let i = 0;
    let price = null;
    let totalPrice = 0;
    let moduloResult = 0;
    let restResult = 0;
    while (true) {
      price = prices[i];
      restResult = Math.floor(totalTimeCalculate / price.time);
      moduloResult = totalTimeCalculate % price.time;
      totalPrice = totalPrice + restResult * price.price;
      totalTimeCalculate = moduloResult;
      i++;
      if (i === prices.length || moduloResult === 0) break;
    }
    if (totalTimeCalculate > 0 && totalPrice === 0) {
      totalPrice = totalPrice + prices[prices.length - 1].price;
    }
    transaction.dataValues.totalCalculated = totalPrice;

    res.status(200).json({ data: transaction });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addTransaction = async (req, res) => {
  try {
    const ownership = await OwnershipModel.findOne({
      where: {
        code: req.body.code,
      },
    });
    if (!ownership) return res.status(404).json({ message: "Unknown Code" });

    const transaction = await TransactionModel.findOne({
      where: {
        [Op.and]: [{ id_ownership: ownership.id }, { time_out: null }],
      },
    });
    if (transaction)
      return res.status(404).json({ message: "The Vehicle is not available" });

    const response = await TransactionModel.create({
      id_ownership: ownership.id,
      id_user: req.userId,
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editTransaction = async (req, res) => {
  try {
    const { id_customer, note, code } = req.body;

    if (code) {
      if (req.username.toLowerCase() !== "superadmin") {
        return res.status(401).json({
          message: "Authentification failed",
        });
      }

      const ownership = await OwnershipModel.findOne({
        where: {
          code: req.body.code,
        },
      });
      if (!ownership) return res.status(404).json({ message: "Unknown Code" });

      const transaction = await TransactionModel.findOne({
        where: {
          [Op.and]: [{ id_ownership: ownership.id }, { time_out: null }],
        },
      });

      if (transaction)
        return res
          .status(404)
          .json({ message: "The Vehicle is not available" });

      await TransactionModel.update(
        {
          id_ownership: ownership.id,
          id_user: req.userId,
        },
        {
          where: {
            id: req.body.id,
          },
        }
      );

      res.status(200).json({ message: "Vehicle changed" });
    } else {
      const editedData = id_customer
        ? {
            id_customer,
            note,
            id_user: req.userId,
          }
        : {
            note,
            id_user: req.userId,
          };

      await TransactionModel.update(editedData, {
        where: {
          id: req.body.id,
        },
      });
      res.status(200).json({ message: "Transaction updated" });
    }
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const endTransaction = async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { id, total, downPayment } = req.body;
    // console.log(id);
    const transactionExist = await TransactionModel.findOne({
      where: {
        [Op.and]: [{ id }, { time_out: null }],
      },
    });

    if (!transactionExist) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "The transaction was paid by another account!!" });
    }

    await TransactionModel.update(
      {
        time_out: new Date(),
        total,
      },
      {
        where: {
          id,
        },
        transaction,
      }
    );

    await PaymentModel.create(
      {
        total: downPayment,
        id_user: req.userId,
        id_transaction: id,
      },
      { transaction }
    );

    await transaction.commit();
    res.status(200).json({
      message:
        total === downPayment
          ? "Transaction successfully end"
          : `Downpayment has been saved, Customer needs pay ${numberWithCommas(
              total - downPayment
            )} again`,
    });
  } catch (error) {
    await transaction.rollback();
    showErrorMessage(res, error);
  }
};

export const deleteTransaction = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }
  try {
    await TransactionModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
