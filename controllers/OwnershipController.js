import OwnershipModel from "../models/OwnershipModel.js";
import SupplierModel from "../models/SupplierModel.js";
import VehicleModel from "../models/VehicleModel.js";
import BrandModel from "../models/BrandModel.js";
import TypeModel from "../models/TypeModel.js";
import { showErrorMessage } from "../utils/Helper.js";
import {
  handleImageError,
  removeImageSafely,
  saveImage,
} from "../utils/ImageStorage.js";
import { Sequelize } from "sequelize";
import db from "../configs/Database.js";

OwnershipModel.belongsTo(SupplierModel, {
  foreignKey: "id_supplier",
});
OwnershipModel.belongsTo(VehicleModel, {
  foreignKey: "id_vehicle",
});

VehicleModel.belongsTo(BrandModel, {
  foreignKey: "id_brand",
});
VehicleModel.belongsTo(TypeModel, {
  foreignKey: "id_type",
});
export const getOwnerships = async (req, res) => {
  try {
    const response = await OwnershipModel.findAll({
      include: [
        {
          model: SupplierModel,
          attributes: ["id", "name", "phone"],
        },
        {
          model: VehicleModel,
          attributes: ["id", "detail_type"],
          include: [
            {
              model: BrandModel,
              attributes: ["id", "name"],
            },
            {
              model: TypeModel,
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      attributes: [
        "id",
        "id_supplier",
        "id_vehicle",
        "code",
        "licence_plate",
        "note",
        "target_value",
        "image",
        [
          Sequelize.literal(`concat('${process.env.BASE_URL}',ownerships.url)`),
          "url",
        ],
      ],
      order: [
        [Sequelize.col("supplier.name"), "asc"],
        ["code", "asc"],
      ],
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getOwnershipTargetValues = async (req, res) => {
  try {
    const [response] = await db.query(`
      SELECT
        o.code,
        o.licence_plate,
        IFNULL(ROUND(actual_transactions.actual_total / o.target_value * 100, 1), 0) AS actual_value,
        IFNULL(ROUND(expected_transactions.expected_total / o.target_value * 100, 1), 0) AS expected_value,
        EXISTS (
          SELECT 1
          FROM transactions t2
          WHERE t2.id_ownership = o.id AND t2.time_out IS NULL
        ) AS is_rented
      FROM ownerships o
      LEFT JOIN (
        SELECT
          t.id_ownership,
          SUM(p.total) AS actual_total
        FROM transactions t
        INNER JOIN payments p ON t.id = p.id_transaction
        WHERE t.time_out >= DATE_FORMAT(CURDATE(), '%Y-%m-01 00:00:00')
          AND t.time_out <= DATE_FORMAT(LAST_DAY(CURDATE()), '%Y-%m-%d 23:59:59')
          AND p.createdAt >= DATE_FORMAT(CURDATE(), '%Y-%m-01 00:00:00')
          AND p.createdAt <= DATE_FORMAT(LAST_DAY(CURDATE()), '%Y-%m-%d 23:59:59')
        GROUP BY t.id_ownership
      ) actual_transactions ON actual_transactions.id_ownership = o.id
      LEFT JOIN (
        SELECT
          t.id_ownership,
          SUM(
            GREATEST(
              t.total - IFNULL((
                SELECT SUM(p.total)
                FROM payments p
                WHERE p.id_transaction = t.id
                  AND DATE_FORMAT(p.createdAt, '%Y-%m') <> DATE_FORMAT(CURDATE(), '%Y-%m')
              ), 0),
              0
            )
          ) AS expected_total
        FROM transactions t
        WHERE t.time_out >= DATE_FORMAT(CURDATE(), '%Y-%m-01 00:00:00')
          AND t.time_out <= DATE_FORMAT(LAST_DAY(CURDATE()), '%Y-%m-%d 23:59:59')
        GROUP BY t.id_ownership
      ) expected_transactions ON expected_transactions.id_ownership = o.id
      WHERE o.target_value > 0
      ORDER BY
        IFNULL(ROUND(actual_transactions.actual_total / o.target_value * 100, 1), 0),
        IFNULL(ROUND(expected_transactions.expected_total / o.target_value * 100, 1), 0),
        o.code
    `);
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailOwnership = async (req, res) => {
  try {
    const response = await OwnershipModel.findOne({
      where: {
        id: req.params.id,
      },
      attributes: [
        "id",
        "id_supplier",
        "id_vehicle",
        "code",
        "licence_plate",
        "note",
        "target_value",
        "image",
        [
          Sequelize.literal(`concat('${process.env.BASE_URL}',ownerships.url)`),
          "url",
        ],
      ],
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addOwnership = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  if (!req.file)
    return res.status(400).json({ message: "No file uploaded" });

  const { id_supplier, id_vehicle, code, licence_plate, note, target_value } =
    req.body;
  let storedImage;
  try {
    storedImage = await saveImage(req.file);
    await OwnershipModel.create({
      id_supplier,
      id_vehicle,
      code,
      licence_plate,
      note,
      image: storedImage.fileName,
      url: storedImage.url,
      target_value,
      id_user: req.userId,
    });

    res.status(200).json({ message: "Ownership created successfully" });
  } catch (error) {
    if (storedImage) await removeImageSafely(storedImage.fileName);
    if (!handleImageError(res, error)) showErrorMessage(res, error);
  }
};

export const editOwnership = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  const ownership = await OwnershipModel.findOne({
    where: {
      id: req.body.id,
    },
  });

  if (!ownership) return res.status(404).json({ message: "Data not found" });
  let storedImage;
  try {
    const { id_supplier, id_vehicle, code, licence_plate, note, target_value } =
      req.body;
    storedImage = await saveImage(req.file);
    await OwnershipModel.update(
      {
        id_supplier,
        id_vehicle,
        code,
        licence_plate,
        note,
        target_value,
        ...(storedImage && {
          image: storedImage.fileName,
          url: storedImage.url,
        }),
        id_user: req.userId,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    if (storedImage) await removeImageSafely(ownership.image);
    res.status(200).json({ message: "Ownership updated" });
  } catch (error) {
    if (storedImage) await removeImageSafely(storedImage.fileName);
    if (!handleImageError(res, error)) showErrorMessage(res, error);
  }
};

export const deleteOwnership = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  const ownership = await OwnershipModel.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!ownership) return res.status(404).json({ message: "Data not found" });
  try {
    await OwnershipModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    await removeImageSafely(ownership.image);
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
