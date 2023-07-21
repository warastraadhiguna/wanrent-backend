import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const TypeModel = db.define(
  "types",
  {
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

export default TypeModel;
