import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const TransactionModel = db.define(
  "transactions",
  {
    id_user: {
      type: Sequelize.INTEGER(11),
      references: "users",
      referencesKey: "id",
    },
    id_ownership: {
      type: Sequelize.INTEGER(11),
      references: "ownerships",
      referencesKey: "id",
    },
    id_customer: {
      type: Sequelize.INTEGER(11),
      references: "customers",
      referencesKey: "id",
    },
    time_in: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    time_out: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    total: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      defaultValue: 0,
    },
    note: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
  },
  {
    //timestamps: false,
    freezeTableName: true,
  }
);

export default TransactionModel;
