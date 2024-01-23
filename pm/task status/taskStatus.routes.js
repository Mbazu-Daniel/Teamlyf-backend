import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';

import {
	createTaskStatus,
	getTaskStatus,
	getTaskStatusById,
	updateTaskStatus,
	deleteTaskStatus,
} from './taskStatus.controllers.js';

const app = express();
const tasksStatusRouter = express.Router();

app.use(
	'/workspace',
	tasksStatusRouter

	//  #swagger.tags = ['Project Priority']
);
tasksStatusRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

// Create a new custom status list
tasksStatusRouter.post('/:workspaceId/task-status', createTaskStatus);

// Get details all custom status list
tasksStatusRouter.get('/:workspaceId/task-status', getTaskStatus);

// Get details of a specific custom status list
tasksStatusRouter.get('/:workspaceId/task-status/:statusId', getTaskStatusById);

// Update details of a specific custom status list
tasksStatusRouter.patch('/:workspaceId/task-status/:statusId', updateTaskStatus);

// Delete a specific custom status list
tasksStatusRouter.delete(
	'/:workspaceId/task-status/:statusId',
	deleteTaskStatus
);

export default tasksStatusRouter;
