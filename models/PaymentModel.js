import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const PaymentModel = db.define(
  "payments",
  {
    id_user: {
      type: Sequelize.INTEGER(11),
      references: "users",
      referencesKey: "id",
    },
    id_transaction: {
      type: Sequelize.INTEGER(11),
      references: "transactions",
      referencesKey: "id",
    },
    total: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
    },
  },
  {
    //timestamps: false,
    freezeTableName: true,
  }
);

export default PaymentModel;
