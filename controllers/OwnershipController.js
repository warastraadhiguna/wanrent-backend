import OwnershipModel from "../models/OwnershipModel.js";
import SupplierModel from "../models/SupplierModel.js";
import VehicleModel from "../models/VehicleModel.js";
import BrandModel from "../models/BrandModel.js";
import TypeModel from "../models/TypeModel.js";
import { showErrorMessage } from "../utils/Helper.js";
import path from "path";
import fs from "fs";
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
        IFNULL(ROUND(SUM(p.total) / o.target_value * 100, 0),1) AS achieved_target,
  EXISTS (
    SELECT 1 FROM transactions t2
    WHERE t2.id_ownership = o.id AND t2.time_out IS NULL
  ) AS is_rented
      FROM ownerships o
      LEFT JOIN transactions t ON o.id = t.id_ownership 
        AND t.time_out >= DATE_FORMAT(CURDATE(), '%Y-%m-01 00:00:00')
        AND t.time_out <= DATE_FORMAT(LAST_DAY(CURDATE()), '%Y-%m-%d 23:59:59')
      LEFT JOIN payments p ON t.id = p.id_transaction
      WHERE o.target_value > 0
      GROUP BY o.code, o.licence_plate, o.target_value
      ORDER BY ROUND(SUM(p.total) / o.target_value * 100, 0)
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

  if (req.files == null)
    return res.status(400).json({ message: "No file uploaded" });

  const { id_supplier, id_vehicle, code, licence_plate, note, target_value } =
    req.body;
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `images/${fileName}`;
  const allowedType = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowedType.includes(file.mimetype))
    return res.status(422).json({ message: "Invalid file type" });

  if (fileSize > 5000000)
    return res.status(422).json({ message: "File size is too big > 5 MB" });

  file.mv(`./public/images/${fileName}`, async (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading file" });
    }
    try {
      await OwnershipModel.create({
        id_supplier,
        id_vehicle,
        code,
        licence_plate,
        note,
        image: fileName,
        url: url,
        target_value,
        id_user: req.userId,
      });

      res.status(200).json({ message: "Ownership created successfully" });
    } catch (error) {
      showErrorMessage(res, error);
    }
  });
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
  let fileName = "";
  if (req.files === null) {
    fileName = ownership.image;
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = file.md5 + ext;
    const allowedType = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedType.includes(file.mimetype))
      return res.status(422).json({ message: "Invalid file type" });

    if (fileSize > 5000000)
      return res.status(422).json({ message: "File size is too big > 5 MB" });

    const filePath = `./public/images/${ownership.image}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error uploading file" });
      }
    });
  }
  try {
    const { id_supplier, id_vehicle, code, licence_plate, note, target_value } =
      req.body;
    const url = `images/${fileName}`;
    await OwnershipModel.update(
      {
        id_supplier,
        id_vehicle,
        code,
        licence_plate,
        note,
        target_value,
        image: fileName,
        url: url,
        id_user: req.userId,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.status(200).json({ message: "Ownership updated" });
  } catch (error) {
    showErrorMessage(res, error);
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
    const filePath = `./public/images/${ownership.image}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await OwnershipModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
