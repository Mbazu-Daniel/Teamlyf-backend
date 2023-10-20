import express from "express";
import { verifyToken } from "../middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../middleware/index.js";
import {
  
  deleteTask,
  getTaskById,
  updateTask,
} from "./tasks.controllers.js";
import {
  createTaskSpace,
  deleteTaskSpace,
  getAllTasksSpace,
  getTaskByIdSpace,
  updateTaskSpace,
  getAllTasksInWorkspace,
  getTaskCountInWorkspace
} from "./tasksSpace.controllers.js";
// const taskRouter = express.Router();
const taskRouter = express.Router({ mergeParams: true });

taskRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

// Get tasks


// taskRouter.get("/:workspaceId/tasks/:id", getTaskById);
// taskRouter.patch("/:workspaceId/tasks/:id", updateTask);
// taskRouter.delete("/:workspaceId/tasks/:id", deleteTask);


taskRouter.get("/:workspaceId/tasks", getAllTasksInWorkspace);

// Get task count in the workspace
taskRouter.get('/:workspaceId/tasks-count', getTaskCountInWorkspace);

// Get all space related tasks
taskRouter.post("/:workspaceId/spaces/:spaceId/tasks", createTaskSpace);
taskRouter.get("/:workspaceId/spaces/:spaceId/tasks", getAllTasksSpace);
taskRouter.get("/:workspaceId/spaces/:spaceId/tasks/:id", getTaskByIdSpace);
taskRouter.patch("/:workspaceId/spaces/:spaceId/tasks/:id", updateTaskSpace);
taskRouter.delete("/:workspaceId/spaces/:spaceId/tasks/:id", deleteTaskSpace);

export default taskRouter;
