import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';
import {
  getAllGroupChats,
  createGroupChat,
  updateGroupChatDetails,
  deleteGroupChat,
  getGroupChatDetails,
  getGroupMembers,
  addMembersToGroup,
  removeMembersFromGroup,
  leaveGroupChat,
  updateEmployeeGroupRole,
  searchGroupsByName,
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

groupRouter.get('/:workspaceId/groups', getAllGroupChats);
groupRouter.post('/:workspaceId/groups', createGroupChat);
groupRouter.get('/:workspaceId/groups/:groupId', getGroupChatDetails);
groupRouter.patch('/:workspaceId/groups/:groupId', updateGroupChatDetails);
groupRouter.delete('/:workspaceId/groups/:groupId', deleteGroupChat);
groupRouter.get('/:workspaceId/groups/:groupId/members', getGroupMembers);
groupRouter.delete('/:workspaceId/groups/:groupId/leave-group', leaveGroupChat);
groupRouter.patch('/:workspaceId/groups/:groupId/update-group-role', updateEmployeeGroupRole);
groupRouter.post(
	'/:workspaceId/groups/:groupId/add-members',
	addMembersToGroup
);
groupRouter.post(
  "/:workspaceId/groups/:groupId/remove-members",
  removeMembersFromGroup

  /* #swagger.parameters['workspaceId'] = {
    in: 'path',
    required: true,
    type: 'string'
}

#swagger.parameters['groupId'] = {
    in: 'path',
    required: true,
    type: 'string'
} 

#swagger.requestBody = {
    required: true,
    content: {
      'application/json': {
        schema: {
          "$ref": "#/components/schemas/RemoveProjectCollaborators"
        }
      }
    }
}


*/
);

export default groupRouter;
