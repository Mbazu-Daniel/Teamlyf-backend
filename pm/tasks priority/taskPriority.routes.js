import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';

import {
	createTaskPriority,
	getTaskPriorities,
	getTaskPriorityById,
	updateTaskPriority,
	deleteTaskPriority,
} from './taskPriority.controllers.js';

const app = express();
const tasksPriorityRouter = express.Router();

app.use(
	'/workspace',
	tasksPriorityRouter

	//  #swagger.tags = ['Task Priority']
);
tasksPriorityRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

// Create a new custom priority list
tasksPriorityRouter.post('/:workspaceId/task-priority', createTaskPriority);

// Get details all custom priority list
tasksPriorityRouter.get('/:workspaceId/task-priority', getTaskPriorities);

// Get details of a specific custom priority list
tasksPriorityRouter.get(
	'/:workspaceId/task-priority/:priorityId',
	getTaskPriorityById
);

// Update details of a specific custom priority list
tasksPriorityRouter.patch(
	'/:workspaceId/task-priority/:priorityId',
	updateTaskPriority
);

// Delete a specific custom priority list
tasksPriorityRouter.delete(
	'/:workspaceId/task-priority/:priorityId',
	deleteTaskPriority
);

export default tasksPriorityRouter;
