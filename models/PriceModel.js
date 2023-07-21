import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const PriceModel = db.define(
  "prices",
  {
    id_user: {
      type: Sequelize.INTEGER(11),
      references: "users",
      referencesKey: "id",
    },
    id_type: {
      type: Sequelize.TINYINT(3),
      references: "types",
      referencesKey: "id",
    },
    time: {
      type: Sequelize.SMALLINT(5),
      allowNull: false,
    },
    price: {
      type: Sequelize.MEDIUMINT(8),
      allowNull: true,
    },
  },
  {
    //timestamps: false,
    freezeTableName: true,
  }
);

export default PriceModel;
