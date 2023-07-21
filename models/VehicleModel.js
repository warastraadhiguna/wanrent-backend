import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const VehicleModel = db.define(
  "vehicles",
  {
    id_user: {
      type: Sequelize.INTEGER(11),
      references: "users",
      referencesKey: "id",
    },
    id_brand: {
      type: Sequelize.INTEGER(11),
      references: "brands",
      referencesKey: "id",
    },
    id_type: {
      type: Sequelize.TINYINT(3),
      references: "types",
      referencesKey: "id",
    },
    detail_type: {
      type: DataTypes.STRING,
      allowNull: false,
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

export default VehicleModel;
