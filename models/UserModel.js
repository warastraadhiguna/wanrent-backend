import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

const { DataTypes } = Sequelize;

const UserModel = db.define(
  "users",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        customValidator(value) {
          if (value === "") {
            throw new Error("Name cannot be empty!");
          }
        },
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "admin",
    },
    image: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    //timestamps: false,
    freezeTableName: true,
  }
);

export default UserModel;
