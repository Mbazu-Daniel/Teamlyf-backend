import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	allEmployeeRoles,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';
import upload from '../../utils/services/multerConfig.js';

import {
	calculateTotalFileSizeInWorkspace,
	createTaskFile,
	deleteTaskFile,
	getAllFiles,
	getTaskFiles,
	shareTaskFile,
	updateTaskFile,
} from './tasksFile.controllers.js';

const taskFileRouter = express.Router();

const app = express();

app.use(
	'/workspace',
	taskFileRouter

	// #swagger.tags = ['Tasks Files']
);

taskFileRouter.use(
	'/:workspaceId',
	verifyToken,
	allEmployeeRoles,
	getCurrentWorkspace
);

// Get all space related tasks
taskFileRouter.post(
	'/:workspaceId/projects/:projectId/tasks/:taskId/files',
	upload.single('file'),
	createTaskFile
);
taskFileRouter.get(
	'/:workspaceId/projects/:projectId/tasks/:taskId/files',
	getTaskFiles
);
// TODO: get all files in a project
// taskFileRouter.get('/:workspaceId/files/', getAllFiles); 
taskFileRouter.patch('/:workspaceId/projects/:projectId/tasks/:taskId/files/:fileId', updateTaskFile);
taskFileRouter.delete('/:workspaceId/projects/:projectId/tasks/:taskId/files/:fileId', deleteTaskFile);
taskFileRouter.post('/:workspaceId/projects/:projectId/tasks/:taskId/files/fileId', shareTaskFile);
// TODO: get total file size in a workspace 
// taskFileRouter.get(
// 	'/:workspaceId/files/calculate-file-size',
// 	calculateTotalFileSizeInWorkspace
// );
export default taskFileRouter;
