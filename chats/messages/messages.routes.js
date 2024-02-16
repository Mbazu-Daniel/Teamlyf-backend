import express from 'express';
import { verifyToken } from '../../utils/middleware/authenticate.js';
import {
	getCurrentEmployee,
	getCurrentWorkspace,
} from '../../utils/middleware/index.js';

import {
	getConversationMessages,
	sendConversationMessage,
	deleteConversationMessage,
} from './messages.controllers.js';

const messageRouter = express.Router();
const app = express();

app.use(
	'/workspace',
	messageRouter
	/* 
  
  #swagger.tags = ['Messages']
  */
);
messageRouter.use(verifyToken, getCurrentEmployee, getCurrentWorkspace);

messageRouter.get(
	'/:workspaceId/conversations/:conversationId/messages',
	getConversationMessages
);
messageRouter.post(
	'/:workspaceId/conversations/:conversationId/messages/send',
	sendConversationMessage
);
messageRouter.delete(
	'/:workspaceId/conversations/:conversationId/messages/:messageId/delete',
	deleteConversationMessage
);

export default messageRouter;
