import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const OwnershipModel = db.define(
  "ownerships",
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
    id_vehicle: {
      type: Sequelize.INTEGER(11),
      references: "vehicles",
      referencesKey: "id",
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    licence_plate: {
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
    note: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    target_value: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
    },
  },
  {
    //timestamps: false,
    freezeTableName: true,
  }
);

export default OwnershipModel;
