import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const prioritySelectOptions = {
	id: true,
	name: true,
	color: true,
};

// TODO: the creation should not work if the taskPriority is not creating correctly
const createTaskPriority = asyncHandler(async (req, res) => {
	try {
		const { name, color, priorities } = req.body;
		const { workspaceId } = req.params;
		// Check if custom priority with the same name already exists
		const existingPriority = await prisma.customTaskPriority.findFirst({
			where: { name },
		});

		if (existingPriority) {
			return res.status(400).json({
				error: `CustomTaskPriority with name '${name}' already exists`,
			});
		}

		// Create the custom priority list
		const customTaskPriority = await prisma.customTaskPriority.create({
			data: {
				name: name.toLowerCase(),
				color,
				workspace: { connect: { id: workspaceId } },
			},

			select: { id: true, name: true},
		});

		// Create task priorities and associate them with the custom priority list
		const createdPriorities = await Promise.all(
			priorities.map(async (priority) => {
				return prisma.taskPriority.create({
					data: {
						name: priority.name,
						color: priority.color,
						customTaskPriority: {
							connect: { id: customTaskPriority.id },
						},
					},

					select: prioritySelectOptions,
				});
			})
		);


		res.status(201).json({
			customTaskPriority: customTaskPriority,
			priorities: createdPrioriti+es,
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
				.filter((status) => !status.id) // Filter out statuses with id (existing statuses)
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
