import asyncHandler from 'express-async-handler';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Fetch all private conversations for the user and start a new private conversation with another user
const getOrCreateOneOnOneChat = asyncHandler(async (req, res) => {
	const { receiverId } = req.body;

	try {
    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
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
          { senderId: req.employeeId, receiverId },
          { senderId: receiverId, receiverId: req.employeeId },
        ],
      },
    });

    // If conversation does not exist, create a new one
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          senderId: req.employeeId,
          receiverId,
        },
      });

	  const payload = { conversationId: conversation.id, message: 'New conversation created' };
      emitSocketEvent(req, senderId, ChatEventEnum.NEW_CHAT_EVENT, payload);
      emitSocketEvent(req, receiverId, ChatEventEnum.NEW_CHAT_EVENT, payload);
    
    }

    res.status(200).json(conversation);
  } catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Get details of a specific private conversation
const getAllConversations = asyncHandler(async (req, res) => {
const employeeId = req.employeeId

	try {
		const conversation = await prisma.conversation.findMany({
			where: {
			OR: [
          { senderId: employeeId },
          { receiverId: employeeId },
        ],
			},
		});

		

		res.status(200).json(conversation);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export { getOrCreateOneOnOneChat, getAllConversations };
