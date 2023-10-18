import express from "express";
import {
  createSubTask,
  getAllSubTasks,
  getSubTaskById,
  deleteSubTask,
  updateSubTask,
} from "./subTasks.controllers.js";

const subTaskRouter = express.Router();

subTaskRouter.post("/", createSubTask);
subTaskRouter.get("/", getAllSubTasks);
subTaskRouter.get("/:id", getSubTaskById);
subTaskRouter.patch("/:id", updateSubTask);
subTaskRouter.delete("/:id", deleteSubTask);

export default subTaskRouter;
