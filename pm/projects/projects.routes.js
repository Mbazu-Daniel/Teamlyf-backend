import express from 'express';
import {
	addCollaboratorsToProject,
	createProject,
	deleteProject,
	getAllProjects,
	getAllTasksInProject,
	getProjectById,
	getSingleTaskInProject,
	removeCollaboratorsFromProject,
	updateProject,
	// calculateProjectProgress,
} from './projects.controllers.js';

import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';
import { verifyToken } from '../../utils/middleware/authenticate.js';
const app = express();
const projectRouter = express.Router();

app.use(
	'/workspace',
	projectRouter

	// #swagger.tags = ['Project']
);
projectRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

projectRouter.post('/:workspaceId/projects', createProject);
projectRouter.get('/:workspaceId/projects', getAllProjects);
projectRouter.get('/:workspaceId/projects/:projectId', getProjectById);
projectRouter.patch('/:workspaceId/projects/:projectId', updateProject);
projectRouter.delete('/:workspaceId/projects/:projectId', deleteProject);

projectRouter.post(
	'/:workspaceId/projects/:projectId/add-collaborators',
	addCollaboratorsToProject
);
projectRouter.post(
	'/:workspaceId/projects/:projectId/remove-collaborators',
	removeCollaboratorsFromProject
);

projectRouter.get(
	'/:workspaceId/projects/:projectId/tasks',
	getAllTasksInProject
);
projectRouter.get(
	'/:workspaceId/projects/:projectId/tasks/:taskId',
	getSingleTaskInProject
);
// projectRouter.get(
// 	'/:workspaceId/projects/:projectId/calculate-progress',
// 	calculateProjectProgress
// );
export default projectRouter;
