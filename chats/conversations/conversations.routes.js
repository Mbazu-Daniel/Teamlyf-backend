import express from "express";
import { verifyToken } from "../../utils/middleware/authenticate.js";
import {
  getCurrentEmployee,
  getCurrentWorkspace,
} from "../../utils/middleware/index.js";

import {
  getOrCreateConversation,
  getAllConversations,
} from "./conversations.controllers.js";

const conversationRouter = express.Router();
const app = express();

app.use(
  "/workspace",
  conversationRouter

  /* 
  
  #swagger.tags = ['Conversations']
  */
);

conversationRouter.use(
  "/:workspaceId",
  verifyToken,
  getCurrentEmployee,
  getCurrentWorkspace
);

conversationRouter.post("/:workspaceId/chat", getOrCreateConversation);
conversationRouter.get(
  "/:workspaceId/chat/:conversationId",
  getAllConversations
);

export default conversationRouter;
