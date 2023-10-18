import express from "express";
import { deleteUser, getAllUsers, getSingleUser } from "./users.controllers.js";

const userRouter = express.Router();

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;
