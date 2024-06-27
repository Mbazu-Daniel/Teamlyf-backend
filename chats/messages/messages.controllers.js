import asyncHandler from "express-async-handler";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// TODO: pin 3 chats

// Send a message in a private conversation
const sendDirectMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content } = req.body;
  const employeeId = req.employeeId;

  try {
    // !content && (!req.files || req.files.length === 0);
    if (!content && !req.files?.attachments?.length) {
      return res.status(400).json({
        error: "Either content or at least one file must be provided",
      });
    }
    // Get the conversation to determine the recipient
    const selectedChat = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!selectedChat) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const recipientId =
      selectedChat.senderId === employeeId
        ? selectedChat.receiverId
        : selectedChat.senderId;

    const messageData = {
      content: content || "",
      employeeId: employeeId,
      conversationId,
    };

    const message = await prisma.directMessage.create({ data: messageData });

    if (req.files && req.files.length > 0) {
      const attachmentPromises = req.files.map(async (file) => {
        const { mimetype, size, originalname, buffer } = file;

        // TODO: move this to validation
        if (size <= 0) {
          throw new Error(`File size is not correct for file ${originalname}`);
        }

        const fileIdentifier = generateFileName();
        const fileUrl = await getObjectSignedUrl(fileIdentifier);

        // Store the file in S3
        await uploadFileToS3(buffer, fileIdentifier, mimetype);

        return prisma.directMessageAttachment.create({
          data: {
            directMessageId: message.id,
            fileName: originalname,
            fileType: mimetype,
            fileSize: size,
            fileUrl,
            fileIdentifier,
          },
        });
      });

      await Promise.all(attachmentPromises);
    }

    const updatedMessage = await prisma.directMessage.findUnique({
      where: { id: message.id },
      include: { attachments: true },
    });

    // Emit NEW_DIRECT_CHAT_EVENT
    const payload = {
      conversationId,
      message: updatedMessage,
    };
    emitSocketEvent(
      req,
      recipientId,
      ChatEventEnum.NEW_DIRECT_CHAT_EVENT,
      payload
    );

    res.status(201).json(updatedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete message for everyone
const deleteMessageForEveryone = asyncHandler(async (req, res) => {
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

    res
      .status(204)
      .json({ message: "Message deleted  for everyone successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const deleteMessageForMyself = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const employeeId = req.employeeId;

  try {
    const visibility = await prisma.directMessageVisibility.findFirst({
      where: {
        directMessageId: messageId,
        chatUserId: employeeId,
      },
    });

    if (!visibility) {
      return res.status(404).json({
        message: `Message ${messageId} not found for user ${employeeId}`,
      });
    }

    await prisma.directMessageVisibility.update({
      where: {
        id: visibility.id,
      },
      data: {
        isVisible: false,
      },
    });

    res
      .status(204)
      .json({ message: "Message deleted for yourself successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get the status of a message (read, delivered, sent)
const getMessageStatus = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
      select: {
        read: true,
        delivered: true,
      },
    });

    if (!message) {
      return res
        .status(404)
        .json({ message: `Message ${messageId} not found` });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all unread messages for a user
const getUnreadMessages = asyncHandler(async (req, res) => {
  try {
    const unreadMessages = await prisma.message.findMany({
      where: {
        employeeId: req.employeeId,
        read: false,
      },
    });

    res.status(200).json(unreadMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Search for messages by content or sender
const searchMessages = asyncHandler(async (req, res) => {
  const { content, senderId } = req.query;

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            text: {
              contains: content,
            },
          },
          {
            employeeId: senderId,
          },
        ],
      },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  getMessageStatus,
  getUnreadMessages,
  searchMessages,
  sendDirectMessage,
  deleteMessageForEveryone,
  deleteMessageForMyself,
};
