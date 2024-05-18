import asyncHandler from "express-async-handler";
import pkg from "@prisma/client";
import { ChatEventEnum } from "../../socket/constants.js";
import { emitSocketEvent } from "../../socket/index.js";
const { PrismaClient, GroupType, GroupRole } = pkg;

const prisma = new PrismaClient();

// TODO: create project endpoints should create a new group during creation
const createGroupChat = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const employeeId = req.employeeId;
  const { name, description, groupType, participantIds } = req.body;

  try {
    // TODO: move this to validator so
    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const newGroup = await prisma.group.create({
      data: {
        name,
        type: groupType || GroupType.TEXT,
        description: description || null,
        createdBy: { connect: { id: employeeId } },
        workspace: { connect: { id: workspaceId } },
      },
    });

    // TODO: Handle duplicate employee in group

    // Add the group creator as an admin
    const groupMembersData = [
      {
        groupId: newGroup.id,
        memberId: employeeId,
        role: GroupType.ADMIN,
      },
    ];

    // Add other participants
    if (participantIds && participantIds.length > 0) {
      // biome-ignore lint/complexity/noForEach: <explanation>
      participantIds.forEach((participantId) => {
        groupMembersData.push({
          groupId: newGroup.id,
          memberId: participantId,
          role: GroupType.MEMBER,
        });
      });
    }

    await prisma.groupMembers.create({
      data: groupMembersData,
    });

    // Emit socket event for other participant
    const payload = {
      groupId: group.id,
      name: group.name,
      description: group.description,
    };

    // Emit socket event to group creator
    emitSocketEvent(
      req,
      employeeId,
      ChatEventEnum.NEW_GROUP_CHAT_EVENT,
      payload
    );

    // biome-ignore lint/complexity/noForEach: <explanation>
    participantIds.forEach((participantId) => {
      emitSocketEvent(
        req,
        participantId,
        ChatEventEnum.NEW_GROUP_CHAT_EVENT,
        payload
      );
    });

    res.status(201).json(newGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const getAllGroupChats = asyncHandler(async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      where: {
        employeeId: req.employeeId,
      },
      include: { groupMembers: true },
    });

    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const getGroupChatDetails = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },

      include: { groupMembers: true },
    });

    if (!group) {
      return res.status(404).json({ message: `Group ${groupId} not found` });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const updateGroupChatDetails = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { name, description, icon } = req.body;

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      return res.status(404).json({ message: `Group ${groupId} not found` });
    }

    const updatedGroup = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        name: name || group.name,
        description: description || group.description,
        icon: icon || group.icon,
      },
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const deleteGroupChat = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        groupMessages: {
          include: {
            attachments: true, // Include attachments in messages
          },
        },
        attachments: true, // Include group-level attachments
      },
    });

    if (!group) {
      return res.status(404).json({ message: `Group ${groupId} not found` });
    }

    // Collect all file identifiers from group message attachments and group attachments
    const messageFileIdentifiers = [];
    for (const message of group.messages) {
      for (const attachment of message.attachments) {
        messageFileIdentifiers.push(attachment.fileIdentifier);
      }
    }
    const groupFileIdentifiers = group.attachments.map(
      (attachment) => attachment.fileIdentifier
    );

    const allFileIdentifiers = [
      ...messageFileIdentifiers,
      ...groupFileIdentifiers,
    ];

    // Delete files from S3
    for (const fileIdentifier of allFileIdentifiers) {
      await deleteFileFromS3Bucket(fileIdentifier);
    }

    // Emit LEAVE_CHAT_EVENT for each group member
    const payload = { groupId, message: "Group has been deleted" };
    for (const groupMember of group.groupMembers) {
      emitSocketEvent(
        req,
        groupMember.member.id,
        ChatEventEnum.LEAVE_CHAT_EVENT,
        payload
      );
    }

    // Cascade delete group members, messages, message attachments, and group attachments
    await prisma.groupMembers.deleteMany({
      where: {
        groupId,
      },
    });
    await prisma.groupMessageAttachment.deleteMany({
      where: {
        groupMessage: {
          groupId,
        },
      },
    });

    await prisma.groupMessage.deleteMany({
      where: {
        groupId,
      },
    });

    await prisma.groupAttachment.deleteMany({
      where: {
        groupId,
      },
    });

    await prisma.group.delete({
      where: {
        id: groupId,
      },
    });

    res.status(204).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const getGroupMembers = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      return res.status(404).json({ message: `Group ${groupId} not found` });
    }

    const groupMembers = await prisma.groupMembers.findMany({
      where: {
        groupId,
      },
      include: {
        member: {
          select: {
            fullName: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!groupMembers || groupMembers.length === 0) {
      return res
        .status(404)
        .json({ message: `No members found for group ${groupId}` });
    }

    res.status(200).json(memberNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const addMembersToGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { memberIds } = req.body;

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });

    if (!group) {
      return res.status(404).json({ message: `Group ${groupId} not found` });
    }

    const groupMemberPromises = memberIds.map((memberId) =>
      prisma.groupMembers.create({
        data: {
          group: { connect: { id: groupId } },
          member: { connect: { id: memberId } },
          role: GroupRole.MEMBER,
        },
      })
    );

    await Promise.all(groupMemberPromises);

    const updatedGroup = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        employee: true,
      },
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const removeMembersFromGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { memberIds } = req.body;

  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        groupMembers: true,
      },
    });

    if (!group) {
      return res.status(404).json({ message: `Group ${groupId} not found` });
    }

    await prisma.groupMembers.deleteMany({
      where: {
        groupId,
        memberId: { in: memberIds },
      },
    });

    const updatedGroup = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        employee: true,
      },
    });

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Search for groups by name
const searchGroupsByName = asyncHandler(async (req, res) => {
  const { name } = req.query;

  try {
    const groups = await prisma.group.findMany({
      where: {
        name: {
          contains: name,
        },
      },
    });

    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  getAllGroupChats,
  createGroupChat,
  updateGroupChatDetails,
  deleteGroupChat,
  getGroupChatDetails,
  getGroupMembers,
  addMembersToGroup,
  removeMembersFromGroup,
  searchGroupsByName,
};
