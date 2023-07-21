import PersonalSavingTakingModel from "../models/PersonalSavingTakingModel.js";
import UserModel from "../models/UserModel.js";
import PersonalSavingModel from "../models/PersonalSavingModel.js";
import SupplierModel from "../models/SupplierModel.js";
import { showErrorMessage } from "../utils/Helper.js";
import db from "../configs/Database.js";
import moment from "moment";
import { Op, Sequelize } from "sequelize";

PersonalSavingTakingModel.belongsTo(PersonalSavingModel, {
  foreignKey: "id_personal_saving",
});
PersonalSavingTakingModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});
PersonalSavingModel.belongsTo(SupplierModel, {
  foreignKey: "id_supplier",
});
PersonalSavingModel.hasMany(PersonalSavingTakingModel, {
  foreignKey: "id_personal_saving",
});
PersonalSavingModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});

export const getPersonalSavingTakings = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    const searchedText = req.query.searchedText || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const response = await PersonalSavingModel.findAll({
      include: [
        {
          model: SupplierModel,
          attributes: ["id", "name"],
        },
        {
          model: PersonalSavingTakingModel,
          attributes: ["id", "total", "createdAt"],
        },
      ],
      attributes: ["id"],
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { $note$: { [Op.like]: `%${searchedText}%` } },
              {
                "$supplier.name$": {
                  [Op.like]: `%${searchedText}%`,
                },
              },
            ],
          },
          {
            personal_saving_date: {
              [Op.between]: [startDate + " 00:00:00", endDate + " 23:59:59"],
            },
          },
        ],
      },
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailPersonalSavingTaking = async (req, res) => {
  try {
    const response = await PersonalSavingTakingModel.findOne({
      where: {
        id: req.params.id,
      },
      attributes: ["id", "id_personal_saving", "time", "personalSavingTaking"],
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addPersonalSavingTaking = async (req, res) => {
  try {
    const { idPersonalSaving, total, untaken } = req.body;
    await PersonalSavingTakingModel.create({
      id_personal_saving: idPersonalSaving,
      total,
      id_user: req.userId,
    });

    if (untaken.toString() === total.toString()) {
      res.status(200).json({ message: "Personal Saving Taking success" });
    } else res.status(200).json({ message: "" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editPersonalSavingTaking = async (req, res) => {
  const personalSaving = await db.personalSaving();
  try {
    const { idPersonalSavingTaking, total, currentTotal } = req.body;
    const personalSavingTaking = await PersonalSavingTakingModel.findOne({
      where: {
        id: idPersonalSavingTaking,
      },
    });

    const lastMonthNewDate = moment(new Date())
      .subtract(1, "months")
      .format("YYYY/MM");

    await PersonalSavingTakingModel.update(
      {
        createdAt: lastMonthNewDate.toString() + "/15",
        total,
        id_user: req.userId,
      },
      {
        where: {
          id: idPersonalSavingTaking,
        },
      }
    );

    await PersonalSavingTakingModel.create({
      id_personal_saving: personalSavingTaking.id_personal_saving,
      total: currentTotal - total,
      id_user: req.userId,
    });

    await personalSaving.commit();
    res.status(200).json({ message: "Data updated" });
  } catch (error) {
    await personalSaving.rollback();
    showErrorMessage(res, error);
  }
};

export const deletePersonalSavingTaking = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await PersonalSavingTakingModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
