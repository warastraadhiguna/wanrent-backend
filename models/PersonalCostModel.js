import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const PersonalCostModel = db.define(
  "personal_costs",
  {
    id_user: {
      type: Sequelize.INTEGER(11),
      references: "users",
      referencesKey: "id",
    },
    id_supplier: {
      type: Sequelize.INTEGER(11),
      references: "suppliers",
      referencesKey: "id",
    },
    total: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    personal_cost_date: {
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

export default PersonalCostModel;
