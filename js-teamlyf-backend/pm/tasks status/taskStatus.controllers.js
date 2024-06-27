import asyncHandler from 'express-async-handler';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const statusSelectOptions = {
	id: true,
	name: true,
	color: true,
};

// TODO: the creation should not work if the taskStatus is not creating correctly
const createTaskStatus = asyncHandler(async (req, res) => {
	try {
		const { name, closedStatusName, statuses } = req.body;
		const { workspaceId } = req.params;
		// Check if custom priority with the same name already exists
		const existingStatus = await prisma.customTaskStatus.findFirst({
			where: { name },
		});

		if (existingStatus) {
			return res.status(400).json({
				error: `CustomTaskStatus with name '${name}' already exists`,
			});
		}

		// Create the custom status list
		const customTaskStatus = await prisma.customTaskStatus.create({
			data: {
				name: name.toLowerCase(),
				closedStatusName,
				workspace: { connect: { id: workspaceId } },
			},

			select: { id: true, name: true, closedStatusName: true },
		});

		// Create task statuses and associate them with the custom status list
		const createdStatuses = await Promise.all(
			statuses.map(async (status) => {
				return prisma.taskStatus.create({
					data: {
						name: status.name,
						color: status.color,
						customTaskStatus: {
							connect: { id: customTaskStatus.id },
						},
					},

					select: statusSelectOptions,
				});
			})
		);

		// If closedStatusName is not set, create a "completed" status
		if (!closedStatusName) {
			const completedStatus = await prisma.taskStatus.create({
				data: {
					name: 'completed',
					color: '#00ff00',
					customTaskStatus: {
						connect: { id: customTaskStatus.id },
					},
				},
			});

			createdStatuses.push(completedStatus);
		}

		res.status(201).json({
			customTaskStatus: customTaskStatus,
			statuses: createdStatuses,
		});
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: error.message });
	}
});

const getTaskStatus = asyncHandler(async (req, res) => {
	try {
		const { workspaceId } = req.params;

		const customTaskStatus = await prisma.customTaskStatus.findMany({
			where: { workspaceId },
			include: { statuses: { select: statusSelectOptions } },
		});

		res.status(200).json(customTaskStatus);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});
const getTaskStatusById = asyncHandler(async (req, res) => {
	try {
		const { statusId, workspaceId } = req.params;

		const customTaskStatus = await prisma.customTaskStatus.findUnique({
			where: { id: statusId, workspaceId },
			include: { statuses: { select: statusSelectOptions } },
		});

		if (!customTaskStatus) {
			return res
				.status(404)
				.json({ message: `CustomTaskStatus ${statusId} not found` });
		}

		res.status(200).json(customTaskStatus);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const updateTaskStatus = asyncHandler(async (req, res) => {
	try {
		const { statusId, workspaceId } = req.params;
		const { name, closedStatusName } = req.body;

		// Update the custom status list
		const updatedCustomTaskStatus = await prisma.customTaskStatus.update({
			where: { id: statusId, workspaceId },
			data: { name, closedStatusName },
		});

		// Update existing project statuses
		const updatedStatuses = await Promise.all(
			statuses
				.filter((status) => status.id) // Filter out statuses without id (new statuses)
				.map(async (status) => {
					return prisma.taskStatus.update({
						where: { id: status.id },
						data: {
							name: status.name,
							color: status.color,
						},
					});
				})
		);

		// Create new project statuses
		const newStatuses = await Promise.all(
			statuses
				.filter((status) => !status.id) 
				.map(async (status) => {
					return prisma.taskStatus.create({
						data: {
							name: status.name,
							color: status.color,
							customTaskStatus: { connect: { id: statusId } },
						},
					});
				})
		);

		res.status(200).json({
			updatedCustomTaskStatus,
			updatedStatuses,
			newStatuses,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const deleteTaskStatus = asyncHandler(async (req, res) => {
	try {
		const { statusId, workspaceId } = req.params;

		const customTaskStatus = await prisma.customTaskStatus.findUnique({
			where: { id: statusId, workspaceId },
		});

		if (!customTaskStatus) {
			return res.status(404).json({
				message: `CustomTaskStatus ${statusId} not found`,
			});
		}

		await prisma.taskStatus.deleteMany({
			where: {
				customTaskStatusId: statusId,
			},
		});

		// Delete the custom status list and its associated task statuses
		await prisma.customTaskStatus.delete({
			where: { id: statusId },
			include: { statuses: true },
		});

		res.status(204).json({
			message:
				'CustomTaskStatus and associated TaskStatuses deleted successfully',
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export {
	createTaskStatus,
	getTaskStatus,
	getTaskStatusById,
	updateTaskStatus,
	deleteTaskStatus,
};
