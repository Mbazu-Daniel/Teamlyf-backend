import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import bodyParser from "body-parser";
dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || process.env.API_PORT;
console.log("Port: " + PORT);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on PORT ${PORT}`);
});
