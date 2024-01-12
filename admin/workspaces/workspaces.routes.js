import express from 'express';
import { verifyToken } from '../../helper/middleware/authenticate.js';
import {
	createWorkspace,
	deleteWorkspace,
	getUserWorkspaces,
	getWorkspaceById,
	updateWorkspace,
	getWorkspaceOwners,
	transferWorkspaceOwnership,
	leaveWorkspace,
} from './workspaces.controllers.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../helper/middleware/index.js';
const app = express();
const workspacesRouter = express.Router();
app.use(
	'/workspace',
	workspacesRouter

	/* 
  
  #swagger.tags = ['Workspace']

    #swagger.security = [{
        "apiKeyAuth": []
    }] 
  */
);

workspacesRouter.use('/', verifyToken);

workspacesRouter.post('/create', createWorkspace);
workspacesRouter.get('/user', getCurrentEmployee, getUserWorkspaces);
workspacesRouter.get(
	'/:workspaceId',

	getCurrentEmployee,
	getWorkspaceById
);
workspacesRouter.patch(
	'/:workspaceId',
	getCurrentWorkspace,
	getCurrentEmployee,
	updateWorkspace
);
workspacesRouter.delete(
	'/:workspaceId',
	getCurrentWorkspace,
	getCurrentEmployee,
	deleteWorkspace
);
workspacesRouter.post(
	'/:workspaceId/transfer-owner',
	getCurrentWorkspace,
	getCurrentEmployee,
	transferWorkspaceOwnership
);
workspacesRouter.post(
	'/:workspaceId/leave-workspace',
	getCurrentWorkspace,
	getCurrentEmployee,
	leaveWorkspace
);
workspacesRouter.get(
	'/workspace-owners',
	getCurrentEmployee,
	getWorkspaceOwners
);

export default workspacesRouter;
