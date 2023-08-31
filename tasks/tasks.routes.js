import express from "express";
import {
  createTask,
  getAllTasks,
  getTaskById,
  deleteTask,
  updateTask,
} from "./tasks.controllers.js";

const taskRouter = express.Router();

taskRouter.post("/", createTask);
taskRouter.get("/", getAllTasks);
taskRouter.get("/:id", getTaskById);
taskRouter.patch("/:id", updateTask);
taskRouter.delete("/:id", deleteTask);

export default taskRouter;
