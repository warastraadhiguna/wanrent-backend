import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const PersonalSavingTakingModel = db.define(
  "personal_saving_takings",
  {
    id_user: {
      type: Sequelize.INTEGER(11),
      references: "users",
      referencesKey: "id",
    },
    id_personal_saving: {
      type: Sequelize.INTEGER(11),
      references: "personal_savings",
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

export default PersonalSavingTakingModel;
