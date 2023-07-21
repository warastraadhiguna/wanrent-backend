import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const CostModel = db.define(
  "costs",
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
    total: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cost_date: {
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

export default CostModel;
