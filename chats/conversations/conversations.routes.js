import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';

import {
	getOrCreateConversation,
	getConversationById,
} from './conversations.controllers.js';

const conversationRouter = express.Router();
const app = express();

app.use(
	'/workspace',
	conversationRouter

	/* 
  
  #swagger.tags = ['Conversations']
  */
);

conversationRouter.use(
	'/:workspaceId',
	verifyToken,
	getCurrentEmployee,
	getCurrentWorkspace
);

conversationRouter.post('/:workspaceId/conversations', getOrCreateConversation);
conversationRouter.get(
	'/:workspaceId/conversations/:conversationId',
	getConversationById
);

export default conversationRouter;
