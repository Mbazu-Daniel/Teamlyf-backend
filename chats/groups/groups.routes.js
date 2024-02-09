import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';
import {
	getAllGroups,
	createGroup,
	updateGroup,
	deleteGroup,
	getGroupDetails,
	getGroupMembers,
	addMembersToGroup,
	removeMembersFromGroup,
} from './groups.controllers.js';

const app = express();
const groupRouter = express.Router();

app.use(
	'/workspace',
	groupRouter

	/* 
  
  #swagger.tags = ['Groups']
  */
);

groupRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

groupRouter.get('/:workspaceId/groups', getAllGroups);
groupRouter.post('/:workspaceId/groups', createGroup);
groupRouter.get('/:workspaceId/groups/:groupId', getGroupDetails);
groupRouter.patch('/:workspaceId/groups/:groupId', updateGroup);
groupRouter.delete('/:workspaceId/groups/:groupId', deleteGroup);
groupRouter.get('/:workspaceId/groups/:groupId/members', getGroupMembers);
groupRouter.post(
	'/:workspaceId/groups/:groupId/add-members',
	addMembersToGroup
);
groupRouter.post(
	'/:workspaceId/groups/:groupId/remove-members',
	removeMembersFromGroup
);

export default groupRouter;
