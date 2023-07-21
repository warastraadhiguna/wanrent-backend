import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const OrderModel = db.define(
  "orders",
  {
    id_user: {
      type: Sequelize.INTEGER(11),
      references: "users",
      referencesKey: "id",
    },
    id_customer: {
      type: Sequelize.INTEGER(11),
      references: "customers",
      referencesKey: "id",
    },
    note: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    order_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    //timestamps: false,
    freezeTableName: true,
  }
);

export default OrderModel;
