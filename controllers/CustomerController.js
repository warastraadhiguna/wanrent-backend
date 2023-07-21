import CustomerModel from "../models/CustomerModel.js";
import path from "path";
import fs from "fs";
import { showErrorMessage } from "../utils/Helper.js";
import { Sequelize, Op } from "sequelize";

export const getCustomers = async (req, res) => {
  try {
    const searchedText = req.query.searchedText || "";
    const response = await CustomerModel.findAll({
      attributes: [
        "id",
        "name",
        "phone",
        "note",
        "image",
        [Sequelize.literal(`concat('${process.env.BASE_URL}',url)`), "url"],
      ],
      where: {
        name: { [Op.like]: `%${searchedText}%` },
      },
      order: [["name", "asc"]],
    });

    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const getDetailCustomer = async (req, res) => {
  try {
    const response = await CustomerModel.findOne({
      attributes: [
        "id",
        "name",
        "phone",
        "note",
        "image",
        [Sequelize.literal(`concat('${process.env.BASE_URL}',url)`), "url"],
      ],
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ data: response });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const addCustomer = async (req, res) => {
  const { name, phone, note } = req.body;
  if (req.files == null) {
    try {
      await CustomerModel.create({
        name,
        phone,
        note,
        id_user: req.userId,
      });

      res.status(200).json({ message: "Customer created successfully" });
    } catch (error) {
      showErrorMessage(res, error);
    }
  } else {
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
        await CustomerModel.create({
          name,
          phone,
          note,
          image: fileName,
          url: url,
          id_user: req.userId,
        });

        res.status(200).json({ message: "Customer created successfully" });
      } catch (error) {
        showErrorMessage(res, error);
      }
    });
  }
};

export const editCustomer = async (req, res) => {
  const customer = await CustomerModel.findOne({
    where: {
      id: req.body.id,
    },
  });
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  let fileName = "";
  if (req.files === null) {
    fileName = customer.image;
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

    const filePath = `./public/images/${customer.image}`;
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
    const updatedField = fileName
      ? {
          name: req.body.name,
          phone: req.body.phone,
          note: req.body.note,
          image: fileName,
          url: `images/${fileName}`,
          id_user: req.userId,
        }
      : {
          name: req.body.name,
          phone: req.body.phone,
          note: req.body.note,
          id_user: req.userId,
        };
    await CustomerModel.update(updatedField, {
      where: {
        id: req.body.id,
      },
    });
    res.status(200).json({ message: "Customer updated" });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const deleteCustomer = async (req, res) => {
  if (req.username.toLowerCase() !== "superadmin") {
    return res.status(401).json({
      message: "Authentification failed",
    });
  }

  const customer = await CustomerModel.findOne({
    where: {
      id: req.params.id,
    },
  });

  if (!customer) return res.status(404).json({ message: "Customer not found" });
  try {
    const filePath = `./public/images/${customer.image}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await CustomerModel.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ message: "Delete data success.." });
  } catch (error) {
    showErrorMessage(res, error);
  }
};
