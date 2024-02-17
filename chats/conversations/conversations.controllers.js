import asyncHandler from 'express-async-handler';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Fetch all private conversations for the user and start a new private conversation with another user
const getOrCreateConversation = asyncHandler(async (req, res) => {
	const { employeeTwoId } = req.body;

	try {
		// Check if a conversation already exists between the two employees
		let conversation = await prisma.conversation.findFirst({
			where: {
				OR: [
					{ employeeOneId: req.employeeId, employeeTwoId },
					{ employeeOneId: employeeTwoId, employeeTwoId: req.employeeId },
				],
			},
		});

		// If conversation does not exist, create a new one
		if (!conversation) {
			conversation = await prisma.conversation.create({
				data: {
					employeeOneId: req.employeeId,
					employeeTwoId,
				},
			});
		}

		res.status(200).json(conversation);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Get details of a specific private conversation
const getConversationById = asyncHandler(async (req, res) => {
	const { conversationId } = req.params;

	try {
		const conversation = await prisma.conversation.findUnique({
			where: {
				id: conversationId,
			},
		});

		if (!conversation) {
			return res
				.status(404)
				.json({ message: `Conversation ${conversationId} not found` });
		}

		res.status(200).json(conversation);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export { getOrCreateConversation, getConversationById };
