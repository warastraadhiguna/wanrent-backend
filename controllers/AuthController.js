import UserModel from "../models/UserModel.js";
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { showErrorMessage } from "../utils/Helper.js";

export const login = async (req, res) => {
  try {
    const { name, username, password } = req.body;
    const user = await UserModel.findOne({
      where: {
        username,
      },
    });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isValid = await bycrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const accessToken = jwt.sign(
      { userId: user.id, name, username },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "20s",
      }
    );
    const refreshToken = jwt.sign(
      { userId: user.id, name, username },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );

    UserModel.update(
      { refresh_token: refreshToken },
      { where: { id: user.id } }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
      secure: process.env.NODE_ENV === "production", //jika https, true
    });

    res.status(200).json({
      data: { name: user.name, role: user.role },
    });
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.sendStatus(204);
    }

    const user = await UserModel.findOne({
      where: {
        refresh_token: refreshToken,
      },
    });
    if (!user) {
      return res.sendStatus(204);
    }

    await UserModel.update({ refresh_token: null }, { where: { id: user.id } });
    res.clearCookie("refreshToken");
    res.sendStatus(200);
  } catch (error) {
    showErrorMessage(res, error);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        message: "No refresh token",
      });
    }
    const user = await UserModel.findOne({
      where: {
        refresh_token: refreshToken,
      },
    });

    if (!user) {
      return res.status(403).json({
        message: "Your Login Session was expired!",
      });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res.sendStatus(403);
        }
        const accessToken = jwt.sign(
          { userId: user.id, name: user.name, username: user.username },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "15s",
          }
        );
        res.json({ accessToken });
      }
    );
  } catch (error) {
    showErrorMessage(res, error);
  }
};
