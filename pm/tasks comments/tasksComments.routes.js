import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';

import {
	createTaskComment,
	getTaskComments,
	deleteTaskComment,
	updateTaskComment,
} from './tasksComments.controllers.js';

const taskCommentRouter = express.Router();

const app = express();

app.use(
	'/workspace',
	taskCommentRouter

	// #swagger.tags = ['Tasks Comments']
);


taskCommentRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

// Get all space related tasks
taskCommentRouter.post(
	'/:workspaceId/projects/:projectId/tasks/:taskId/comments',
	createTaskComment
);
taskCommentRouter.get(
	'/:workspaceId/projects/:projectId/tasks/:taskId/comments',
	getTaskComments
);
taskCommentRouter.patch(
	'/:workspaceId/projects/:projectId/tasks/:taskId/comments/:id',
	updateTaskComment
);
taskCommentRouter.delete(
	'/:workspaceId/projects/:projectId/tasks/:taskId/comments/:id',
	deleteTaskComment
);
export default taskCommentRouter;
