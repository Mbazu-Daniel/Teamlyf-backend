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
			priorities: createdPriorities,
		});
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: error.message });
	}
});

const getTaskPriorities = asyncHandler(async (req, res) => {
	try {
		const { workspaceId } = req.params;

		const customTaskPriority = await prisma.customTaskPriority.findMany({
			where: { workspaceId },
			include: { priorities: { select: prioritySelectOptions } },
		});

		res.status(200).json(customTaskPriority);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});
const getTaskPriorityById = asyncHandler(async (req, res) => {
	try {
		const { priorityId, workspaceId } = req.params;

		const customTaskPriority = await prisma.customTaskPriority.findUnique({
			where: { id: priorityId, workspaceId },
			include: { priorities: { select: prioritySelectOptions } },
		});

		if (!customTaskPriority) {
			return res
				.status(404)
				.json({ message: `CustomTaskPriority ${priorityId} not found` });
		}

		res.status(200).json(customTaskPriority);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const updateTaskPriority = asyncHandler(async (req, res) => {
	try {
		const { priorityId, workspaceId } = req.params;
		const { name } = req.body;

		// Update the custom priority list
		const updatedCustomTaskPriority = await prisma.customTaskPriority.update({
			where: { id: priorityId, workspaceId },
			data: { name },
		});

	
		const updatedPriorities = await Promise.all(
			priorities
				.filter((priority) => priority.id) 
				.map(async (priority) => {
					return prisma.taskPriority.update({
						where: { id: priority.id },
						data: {
							name: priority.name,
							color: priority.color,
						},
					});
				})
		);

		// Create new project priorities
		const newPriorities = await Promise.all(
			priorities
				.filter((priority) => !priority.id) // Filter out priorities with id (existing priorities)
				.map(async (priority) => {
					return prisma.taskPriority.create({
						data: {
							name: priority.name,
							color: priority.color,
							customTaskPriority: { connect: { id: priorityId } },
						},
					});
				})
		);

		res.status(200).json({
			updatedCustomTaskPriority,
			updatedPriorities,
			newPriorities,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const deleteTaskPriority = asyncHandler(async (req, res) => {
	try {
		const { priorityId, workspaceId } = req.params;

		const customTaskPriority = await prisma.customTaskPriority.findUnique({
			where: { id: priorityId, workspaceId },
		});

		if (!customTaskPriority) {
			return res.status(404).json({
				message: `CustomTaskPriority ${priorityId} not found`,
			});
		}

		await prisma.taskPriority.deleteMany({
			where: {
				customTaskPriorityId: priorityId,
			},
		});

		// Delete the custom priority list and its associated task priorities
		await prisma.customTaskPriority.delete({
			where: { id: priorityId },
			include: { priorities: true },
		});

		res.status(204).json({
			message:
				'CustomTaskPriority and associated TaskPriorities deleted successfully',
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export {
	createTaskPriority,
	getTaskPriorities,
	getTaskPriorityById,
	updateTaskPriority,
	deleteTaskPriority,
};
