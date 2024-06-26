import asyncHandler from "express-async-handler";
import pkg from "@prisma/client";
import { ChatEventEnum } from "../../socket/constants.js";
import { emitSocketEvent } from "../../socket/index.js";
const { PrismaClient, GroupType, GroupMemberRole } = pkg;

const prisma = new PrismaClient();

// TODO: attach file on group messaging 
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

const leaveGroupChat = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const employeeId = req.employeeId;
  try {
    const group = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
    });
    if (!group) {
      return res.status(404).json({ message: `Group ${groupId} not found` });
    }

    const groupMember = await prisma.groupMembers.findFirst({
      where: {
        groupId,
        memberId: employeeId,
      },
    });

    if (!groupMember) {
      return res
        .status(404)
        .json({ message: `Employee ${employeeId} not found in group` });
    }

    // Prevent admin from leaving the group if they are the only admin
    if (groupMember.role === GroupMemberRole.ADMIN) {
      const adminCount = await prisma.groupMembers.count({
        where: {
          groupId,
          role: GroupMemberRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        return res.status(403).json({
          message:
            "There must be at least one admin in the group. Please assign a new admin role first.",
        });
      }
    }

    // delete group member from group
    await prisma.groupMembers.delete({
      where: {
        id: groupMember.id,
      },
    });

    const payload = { groupId, message: "Left group chat" };

    emitSocketEvent(
      req,
      groupMember.memberId,
      ChatEventEnum.LEAVE_CHAT_EVENT,
      payload
    );

    res.status(200).json({ message: "Successfully left the group chat" });
  } catch (error) {
    console.error(error);
  }
});

const updateEmployeeGroupRole = asyncHandler(async (req, res) => {
  const { groupId, employeeId } = req.params;
  const { newRole, employeeIdToUpdate } = req.body;

  try {
    const requestingMember = await prisma.groupMembers.findFirst({
      where: {
        groupId,
        memberId: employeeId,
      },
    });

    if (
      !requestingMember ||
      (requestingMember.role !== GroupMemberRole.ADMIN &&
        requestingMember.role !== GroupMemberRole.MODERATOR)
    ) {
      return res
        .status(403)
        .json({ message: "Only admins or moderators can update roles" });
    }

    // Check if the target employee is a member of the group
    const groupMember = await prisma.groupMembers.findFirst({
      where: {
        groupId,
        memberId: employeeIdToUpdate,
      },
    });

    if (!groupMember) {
      return res
        .status(404)
        .json({ message: `Employee ${employeeIdToUpdate} not found in group` });
    }

    // Update the role of the group member
    const updatedGroupMember = await prisma.groupMembers.update({
      where: {
        id: groupMember.id,
      },
      data: {
        role: newRole,
      },
    });
    res.status(200).json(updatedGroupMember);
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

    const existingMembers = await prisma.groupMembers.findMany({
      where: {
        groupId: groupId,
        memberId: {
          in: memberIds,
        },
      },
      select: {
        memberId: true,
      },
    });

    const existingMemberIds = new Set(
      existingMembers.map((member) => member.memberId)
    );

    const newMemberIds = memberIds.filter(
      (memberId) => !existingMemberIds.has(memberId)
    );

    if (newMemberIds.length === 0) {
      return res
        .status(400)
        .json({ message: "All provided members are already in the group" });
    }

    const groupMemberPromises = memberIds.map((memberId) =>
      prisma.groupMembers.create({
        data: {
          group: { connect: { id: groupId } },
          groupMembers: { connect: { id: memberId } },
          role: GroupMemberRole.MEMBER,
        },
      })
    );

    await Promise.all(groupMemberPromises);

    // Emit JOIN_CHAT_EVENT for each new member
    const payload = { groupId, message: "Joined group chat" };

    // biome-ignore lint/complexity/noForEach: <explanation>
    newMemberIds.forEach((memberId) => {
      emitSocketEvent(req, memberId, ChatEventEnum.JOIN_CHAT_EVENT, payload);
    });
    const updatedGroup = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        groupMembers: true,
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

    const payload = { groupId, message: "Left group chat" };
    for (const memberId of memberIds) {
      emitSocketEvent(req, memberId, ChatEventEnum.LEAVE_CHAT_EVENT, payload);
    }

    const updatedGroup = await prisma.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        groupMembers: true,
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
  leaveGroupChat,
  updateEmployeeGroupRole,
};
