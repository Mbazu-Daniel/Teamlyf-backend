import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';

import {
	createProjectStatus,
	getAllProjectStatus,
	getProjectStatusById,
	updateProjectStatus,
	deleteProjectStatus,
} from './projectStatus.controllers.js';

const app = express();
const projectStatusRouter = express.Router();

app.use(
	'/workspace',
	projectStatusRouter

	//  #swagger.tags = ['Project Status']
);
projectStatusRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

// Create a new project status list
projectStatusRouter.post('/:workspaceId/project-status', createProjectStatus);

// Get details all project status list
projectStatusRouter.get('/:workspaceId/project-status', getAllProjectStatus);

// Get details of a specific project status list
projectStatusRouter.get(
	'/:workspaceId/project-status/:statusId',
	getProjectStatusById
);

// Update details of a specific project status list
projectStatusRouter.patch(
	'/:workspaceId/project-status/:statusId',
	updateProjectStatus
);

// Delete a specific project status list
projectStatusRouter.delete(
	'/:workspaceId/project-status/:statusId',
	deleteProjectStatus
);

export default projectStatusRouter;
