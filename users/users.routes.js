import express from "express";
import { getAllUsers, getSingleUser } from "./users.controllers.js";

const userRouter = express.Router();

userRouter.get("/", verifyAdmin, getAllUsers);
userRouter.get("/:id", verifyLogin, getSingleUser);


export default userRouter;