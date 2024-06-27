import express from 'express';
import {
	createSubtask,
	deleteSubtask,
	getAllSubtasks,
	updateSubtask,
} from './subTasks.controllers.js';

import { verifyToken } from '../../utils/middleware/authenticate.js';

import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';
import { checkTaskExists } from '../../utils/middleware/checkTaskExists.js';

const app = express();

const subtaskRouter = express.Router();


app.use(
	'/workspace',
	subtaskRouter

	// #swagger.tags = ['Sub Task']
);

subtaskRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

// Get all space related tasks
subtaskRouter.post(
	'/:workspaceId/projects/:projectId/tasks/:taskId/subtasks',
	checkTaskExists,
	createSubtask
);
subtaskRouter.get(
	'/:workspaceId/projects/:projectId/tasks/:taskId/subtasks',
	checkTaskExists,
	getAllSubtasks
);
subtaskRouter.patch(
	'/:workspaceId/projects/:projectId/tasks/:taskId/subtasks/:id',
	checkTaskExists,
	updateSubtask
);
subtaskRouter.delete(
	'/:workspaceId/projects/:projectId/tasks/:taskId/subtasks/:id',
	checkTaskExists,
	deleteSubtask
);

export default subtaskRouter;
