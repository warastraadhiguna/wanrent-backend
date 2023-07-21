import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/UserRoute.js";
import typeRouter from "./routes/TypeRoute.js";
import brandRouter from "./routes/BrandRoute.js";
import vehicleRouter from "./routes/VehicleRoute.js";
import suppierRouter from "./routes/SupplierRoute.js";
import ownershipRouter from "./routes/OwnershipRoute.js";
import customerRouter from "./routes/CustomerRoute.js";
import transactionRouter from "./routes/TransactionRoute.js";
import paymentRouter from "./routes/PaymentRoute.js";
import authRouter from "./routes/AuthRoute.js";
import costRouter from "./routes/CostRoute.js";
import personalCostRouter from "./routes/PersonalCostRoute.js";
import personalDebtRouter from "./routes/PersonalDebtRoute.js";
import personalDebtPaymentRouter from "./routes/PersonalDebtPaymentRoute.js";
import personalSavingRouter from "./routes/PersonalSavingRoute.js";
import personalSavingTakingRouter from "./routes/PersonalSavingTakingRoute.js";
import companyCostRouter from "./routes/CompanyCostRoute.js";

import priceRouter from "./routes/PriceRoute.js";
import orderRouter from "./routes/OrderRoute.js";
import reportRouter from "./routes/ReportRoute.js";

import cookieParser from "cookie-parser";
import FileUpload from "express-fileupload";

const app = express();
dotenv.config();

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
// app.use(cors({ credentials: true, origin: "http://192.168.1.100:3000" }));

//user wajib login dan hanya bisa dr alamat ini
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public")); // spy public bisa diakses
app.use(FileUpload());
app.use(ownershipRouter);
app.use(priceRouter);
app.use(transactionRouter);
app.use(paymentRouter);
app.use(vehicleRouter);
app.use(brandRouter);
app.use(typeRouter);
app.use(personalCostRouter);
app.use(personalDebtRouter);
app.use(personalDebtPaymentRouter);
app.use(personalSavingRouter);
app.use(personalSavingTakingRouter);
app.use(companyCostRouter);
app.use(userRouter);
app.use(suppierRouter);
app.use(reportRouter);
app.use(customerRouter);
app.use(authRouter);
app.use(costRouter);
app.use(orderRouter);
app.listen(process.env.EXPRESS_PORT, () => {
  console.log("Server is running on port " + process.env.EXPRESS_PORT);
});
