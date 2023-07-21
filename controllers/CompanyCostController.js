import CompanyCostModel from "../models/CompanyCostModel.js";
import UserModel from "../models/UserModel.js";
import { Op, Sequelize } from "sequelize";
import { showErrorMessage } from "../utils/Helper.js";

CompanyCostModel.belongsTo(UserModel, {
  foreignKey: "id_user",
});

export const getCompanyCosts = async (req, res) => {
  try {
    const searchedText = req.query.searchedText || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const response = await CompanyCostModel.findAll({
      include: [
        {
          model: UserModel,
          attributes: ["id", "name"],
        },
      ],
      attributes: ["id", "id_user", "total", "note", "company_cost_date"],
      where: {
        [Op.and]: [
          { $note$: { [Op.like]: `%${searchedText}%` } },
          {
            company_cost_date: {
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

export const getDetailCompanyCost = async (req, res) => {
  try {
    const response = await CompanyCostModel.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addCompanyCost = async (req, res) => {
  try {
    const { total, note, company_cost_date } = req.body;

    await CompanyCostModel.create({
      total,
      note,
      company_cost_date,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Company Cost created successfully" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const editCompanyCost = async (req, res) => {
  try {
    await CompanyCostModel.update(
      {
        name: req.body.name,
        id_user: req.userId,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.status(200).json({ message: "CompanyCost updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deleteCompanyCost = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  try {
    await CompanyCostModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
