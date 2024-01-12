import express from "express";
import {
  deleteUser,
  getUserByEmail,
  getAllUsers,
  getSingleUser,
} from "./users.controllers.js";

const app = express();
const userRouter = express.Router();
app.use(
  "/users",
  userRouter

  //  #swagger.tags = ['Users']
);

userRouter.get("/all", getAllUsers);
userRouter.get("/email", getUserByEmail);
userRouter.get("/:id", getSingleUser);
userRouter.delete("/:id", deleteUser);

export default userRouter;
