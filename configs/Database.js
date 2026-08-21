import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sanitizeSqlLog = (message) =>
  String(message)
    .replace(/'(?:''|\\'|[^'])*'/g, "'[REDACTED]'")
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, "[REDACTED_TOKEN]")
    .replace(/\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}/g, "[REDACTED_PASSWORD]");

const sequelizeLogging =
  process.env.NODE_ENV === "development"
    ? (message) => console.log(sanitizeSqlLog(message))
    : false;

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: sequelizeLogging,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+07:00",
  }
);

export default db;
