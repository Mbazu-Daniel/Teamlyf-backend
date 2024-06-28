import express from "express";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";

import {
  // getConversationMessages,
  sendDirectMessage,
  deleteMessageForEveryone,
  deleteMessageForMyself,
} from "./messages.controllers.js";

const messageRouter = express.Router();
const app = express();

app.use(
  "/:workspaceId",
  messageRouter
  /* 
  
  #swagger.tags = ['Messages']
  */
);
messageRouter.use(verifyToken, getCurrentEmployee, getCurrentWorkspace);

messageRouter.post(
  "/:workspaceId/conversations/:conversationId/messages/send",
  sendDirectMessage
);
messageRouter.delete("/messages/:messageId/everyone", deleteMessageForEveryone);
messageRouter.delete("/messages/:messageId/myself", deleteMessageForMyself);

export default messageRouter;
