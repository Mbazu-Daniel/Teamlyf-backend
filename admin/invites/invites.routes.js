import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';
import { generateInviteLink, joinWorkspace } from './invites.controllers.js';
import {
	validateGenerateInviteLink,
	validateJoinWorkspace,
} from './invites.validate.js';

const app = express();

const inviteRouter = express.Router();
app.use(
	'/invites',
	inviteRouter
	//  #swagger.tags = ['Invite']
);

inviteRouter.use('/:workspaceId', verifyToken);

inviteRouter.post(
	'/:workspaceId/generate-invite-link',
	getCurrentWorkspace,
	getCurrentEmployee,
	validateGenerateInviteLink,
	generateInviteLink
);
inviteRouter.post('/join/:inviteToken', validateJoinWorkspace, joinWorkspace);

export default inviteRouter;
