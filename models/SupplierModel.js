import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const SupplierModel = db.define(
  "suppliers",
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
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    //timestamps: false,
    freezeTableName: true,
  }
);

export default SupplierModel;
