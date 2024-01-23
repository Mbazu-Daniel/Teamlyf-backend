import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';

import {
	createProjectPriority,
	getProjectPriority,
	getProjectPriorityById,
	deleteProjectPriority,
	updateProjectPriority,
} from './projectPriority.controllers.js';

const app = express();
const projectPriorityRouter = express.Router();
app.use(
	'/',
	projectPriorityRouter

	//  #swagger.tags = ['Project Priority']
);

projectPriorityRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

// Create a new project priority
projectPriorityRouter.post(
	'/:workspaceId/project-priority',
	createProjectPriority
);

// Get all project priority
projectPriorityRouter.get('/:workspaceId/project-priority', getProjectPriority);

// Get  project priority by id
projectPriorityRouter.get(
	'/:workspaceId/project-priority/:priorityId',
	getProjectPriorityById
);

// Update a project priority
projectPriorityRouter.patch(
	'/:workspaceId/project-priority/:priorityId',
	updateProjectPriority
);

// Delete a project priority
projectPriorityRouter.delete(
	'/:workspaceId/project-priority/:priorityId',
	deleteProjectPriority
);

export default projectPriorityRouter;
