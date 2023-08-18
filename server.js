import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";

// local imports
import connectDB from "./config/connectDB.js";
import authRouter from "./auth/auth.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ENDPOINTS
app.get("/", (req, res) => {
  res.send("Healthy API");
});

const basePath = "/api/v1";
app.use(`${basePath}/auth`, authRouter);

const PORT = process.env.PORT || process.env.API_PORT;
console.log("Port: " + PORT);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on PORT ${PORT}`);
});
