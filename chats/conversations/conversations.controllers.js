import asyncHandler from "express-async-handler";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// TODO: attach file on private messaging
// TODO: can delete their entire message for everyone
// TODO: delete message just for themselves
// TODO: edit their messages
// TODO: conversation will be invisible for only the chat user that calls the function

// Fetch all private conversations for the user and start a new private conversation with another user
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.employeeId;
  try {
    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    // TODO: for now we allow user not to send to themselves
    if (receiverId === senderId) {
      return res
        .status(400)
        .json({ error: "Cannot create a conversation with yourself" });
    }

    // Check if the sender and receiver exist
    const senderExists = await prisma.employee.findUnique({
      where: { id: senderId },
    });

    const receiverExists = await prisma.employee.findUnique({
      where: { id: receiverId },
    });

    if (!senderExists || !receiverExists) {
      return res
        .status(404)
        .json({ error: "One or both employees do not exist" });
    }
    // Check if a conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { senderId: senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    // If conversation does not exist, create a new one
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          senderId: senderId,
          receiverId,
        },
      });

      await prisma.conversationVisibility.createMany({
        data: [
          { conversationId: conversation.id, chatUserId: senderId },
          { conversationId: conversation.id, chatUserId: receiverId },
        ],
      });

      const payload = {
        conversationId: conversation.id,
        message: "New conversation created",
      };
      emitSocketEvent(req, receiverId, ChatEventEnum.NEW_CHAT_EVENT, payload);
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all  users conversation
const getAllConversations = asyncHandler(async (req, res) => {
  const employeeId = req.employeeId;

  try {
    const conversation = await prisma.conversation.findMany({
      where: {
        OR: [{ senderId: employeeId }, { receiverId: employeeId }],
      },
    });

    res.status(200).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



export { getOrCreateConversation, getAllConversations };
