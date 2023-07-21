import TypeModel from "../models/TypeModel.js";
import { showErrorMessage } from "../utils/Helper.js";

export const getTypes = async (req, res) => {
  try {
    const response = await TypeModel.findAll({
      attributes: ["id", "name"],
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailType = async (req, res) => {
  try {
    const response = await TypeModel.findOne({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
