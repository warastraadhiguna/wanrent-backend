import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const BrandModel = db.define(
  "brands",
  {
    id_user: {
      type: Sequelize.INTEGER(11),
      references: "users",
      referencesKey: "id",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    //timestamps: false,
    freezeTableName: true,
  }
);

export default BrandModel;
