import { registerUser } from "./auth.controllers.js";

import express from "express";

const authRouter = express.Router();

authRouter.post("/register", registerUser);

export default authRouter;
