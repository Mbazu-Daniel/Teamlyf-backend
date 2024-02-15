import asyncHandler from 'express-async-handler';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Get all messages in a private conversation
const getConversationMessages = asyncHandler(async (req, res) => {
	const { conversationId } = req.params;

	try {
		const messages = await prisma.directMessage.findMany({
			where: {
				conversationId,
			},
		});

		res.status(200).json(messages);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Send a message in a private conversation
const sendConversationMessage = asyncHandler(async (req, res) => {
	const { conversationId } = req.params;
	const { content } = req.body;

	try {
		const message = await prisma.directMessage.create({
			data: {
				content,
				employeeId: req.employeeId,
				conversationId,
			},
		});
		res.status(201).json(message);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Delete a message in a private conversation (if permitted)
const deleteConversationMessage = asyncHandler(async (req, res) => {
	const { messageId } = req.params;

	try {
		const message = await prisma.directMessage.findUnique({
			where: {
				id: messageId,
			},
		});

		if (!message) {
			return res
				.status(404)
				.json({ message: `Message ${messageId} not found` });
		}

		await prisma.directMessage.delete({
			where: {
				id: messageId,
			},
		});

		res.status(204).json({ message: 'Message deleted successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export {
	getOrCreateConversation,
	getConversationById,
	getConversationMessages,
	sendConversationMessage,
	deleteConversationMessage,
};
