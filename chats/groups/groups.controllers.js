import asyncHandler from 'express-async-handler';
import pkg from '@prisma/client';
const { PrismaClient, MessageType, GroupRole } = pkg;
const prisma = new PrismaClient();

// TODO: create project endpoints should create a new group during creation
const createGroup = asyncHandler(async (req, res) => {
	const { workspaceId } = req.params;
	const { name, messageType } = req.body;

	try {
		if (!name) {
			return res.status(400).json({ error: 'Group name is required' });
		}

		const group = await prisma.group.create({
			data: {
				name,
				type: messageType || MessageType.TEXT,
				createdBy: { connect: { id: req.employeeId } },
				workspace: { connect: { id: workspaceId } },
			},
		});

		await prisma.groupMembers.create({
			data: {
				group: { connect: { id: group.id } },
				member: { connect: { id: req.employeeId } },
				role: GroupRole.ADMIN,
			},
		});

		res.status(201).json(group);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const getAllGroups = asyncHandler(async (req, res) => {
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

const getGroupDetails = asyncHandler(async (req, res) => {
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

const updateGroup = asyncHandler(async (req, res) => {
	const { groupId } = req.params;
	const { name, description, thumbnail } = req.body;

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
				thumbnail: thumbnail || group.thumbnail,
			},
		});

		res.status(200).json(updatedGroup);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const deleteGroup = asyncHandler(async (req, res) => {
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

		await prisma.groupMembers.deleteMany({
			where: {
				groupId,
			},
		});

		await prisma.group.delete({
			where: {
				id: groupId,
			},
		});

		res.status(204).json({ message: 'Group deleted successfully' });
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
			include: {
				groupMembers: {
					include: {
						member: true,
					},
				},
			},
		});

		if (!group) {
			return res.status(404).json({ message: `Group ${groupId} not found` });
		}

		// Extract member names from groupMembers
		const memberNames = group.groupMembers.map((groupMember) => ({
			fullName: groupMember.member.fullName,
			image: groupMember.member.image,
		}));

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

export {
	getAllGroups,
	createGroup,
	updateGroup,
	deleteGroup,
	getGroupDetails,
	getGroupMembers,
	addMembersToGroup,
	removeMembersFromGroup,
};
