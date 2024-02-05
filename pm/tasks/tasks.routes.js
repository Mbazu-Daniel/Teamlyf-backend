import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';

import {
	createTask,
	deleteTask,
	getAllTasksInWorkspace,
	getAllTasks,
	getTaskById,
	updateTask,
	addCollaboratorsToTask,
	removeCollaboratorsFromTask,
	getTaskCountInWorkspace,
} from './tasks.controllers.js';
import { checkTaskExists } from '../../utils/middleware/checkTaskExists.js';
// const taskRouter = express.Router();
const taskRouter = express.Router();
const app = express();

app.use(
	'/workspace',
	taskRouter

	// #swagger.tags = ['Tasks']
);

taskRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

taskRouter.get('/:workspaceId/tasks', getAllTasksInWorkspace);

// Get task count in the workspace
taskRouter.get('/:workspaceId/tasks-count', getTaskCountInWorkspace);

// Get all space related tasks
taskRouter.post('/:workspaceId/projects/:projectId/tasks', createTask);
taskRouter.get('/:workspaceId/projects/:projectId/tasks', getAllTasks);
taskRouter.get('/:workspaceId/projects/:projectId/tasks/:taskId', getTaskById);
taskRouter.patch(
	'/:workspaceId/projects/:projectId/tasks/:taskId',
	checkTaskExists,
	updateTask
);
taskRouter.delete(
	'/:workspaceId/projects/:projectId/tasks/:taskId',
	checkTaskExists,
	deleteTask
);

taskRouter.post(
	'/:workspaceId/projects/:projectId/tasks/:taskId/add-collaborators',
	checkTaskExists,
	addCollaboratorsToTask
);
taskRouter.post(
	'/:workspaceId/projects/:projectId/tasks/:taskId/remove-collaborators',
	checkTaskExists,
	removeCollaboratorsFromTask
);
export default taskRouter;
