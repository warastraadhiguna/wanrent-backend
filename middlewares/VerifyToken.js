import jwt from "jsonwebtoken";

export const VerifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
      return res.status(401).json({
        message: "Authentification failed",
      });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          message: "Authentification failed",
        });
      }

      req.userId = decoded.userId;
      req.username = decoded.username;
      next();
    });
  } catch (error) {
    res.status(401).json({
      message: "Authentication failed",
    });
  }
};
