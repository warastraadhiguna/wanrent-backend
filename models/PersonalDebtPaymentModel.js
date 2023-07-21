import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const PersonalDebtPaymentModel = db.define(
  "personal_debt_payments",
  {
    id_user: {
      type: Sequelize.INTEGER(11),
      references: "users",
      referencesKey: "id",
    },
    id_personal_debt: {
      type: Sequelize.INTEGER(11),
      references: "personal_debts",
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

export default PersonalDebtPaymentModel;
