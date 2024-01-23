import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const prioritySelectOptions = {
	id: true,
	name: true,
	color: true,
};

const createProjectPriority = asyncHandler(async (req, res) => {
	try {
		const { name, priorities } = req.body;
		const { workspaceId } = req.params;

		// Check if custom priority with the same name already exists
		const existingCustomPriority = await prisma.customProjectPriority.findFirst(
			{
				where: { name },
			}
		);

		if (existingCustomPriority) {
			return res.status(400).json({
				error: `CustomProjectPriority with name '${name}' already exists`,
			});
		}

		// Create the custom priority list
		const customProjectPriority = await prisma.customProjectPriority.create({
			data: {
				name: name.toLowerCase(),
				workspace: { connect: { id: workspaceId } },
			},
		});

		// Create project priority and associate them with the custom priority list
		const createdPriority = await Promise.all(
			priorities.map(async (priority) => {
				const createdPriority = prisma.projectPriority.create({
					data: {
						name: priority.name,
						color: priority.color,

						customProjectPriority: {
							connect: { id: customProjectPriority.id },
						},
					},

					select: prioritySelectOptions,
				});

				return createdPriority;
			})
		);

		res.status(201).json({
			customProjectPriority: customProjectPriority.name,
			createdPriority,
		});
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: error.message });
	}
});

const getProjectPriority = asyncHandler(async (req, res) => {
	try {
		const { workspaceId } = req.params;

		const customProjectPriority = await prisma.customProjectPriority.findMany({
			where: { workspaceId },
			include: { priority: { select: prioritySelectOptions } },
		});

		res.status(200).json(customProjectPriority);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const getProjectPriorityById = asyncHandler(async (req, res) => {
	try {
		const { priorityId, workspaceId } = req.params;

		const customProjectPriority = await prisma.customProjectPriority.findUnique(
			{
				where: { id: priorityId, workspaceId },
				include: { priority: { select: prioritySelectOptions } },
			}
		);

		if (!customProjectPriority) {
			return res.status(404).json({
				message: `CustomProjectPriority ${priorityId} not found`,
			});
		}

		res.status(200).json(customProjectPriority);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const updateProjectPriority = asyncHandler(async (req, res) => {
	try {
		const { priorityId, workspaceId } = req.params;
		const { name, priorities } = req.body;

		// Update the custom project priority name
		const updatedCustomProjectPriority =
			await prisma.customProjectPriority.update({
				where: { id: priorityId, workspaceId },
				data: { name },
			});

		// Update existing project priorities
		const updatedPriorities = await Promise.all(
			priorities
				.filter((priority) => priority.id) // Filter out priorities without id (new priorities)
				.map(async (priority) => {
					return prisma.projectPriority.update({
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
					return prisma.projectPriority.create({
						data: {
							name: priority.name,
							color: priority.color,
							customProjectPriority: { connect: { id: priorityId } },
						},
					});
				})
		);

		res.status(200).json({
			updatedCustomProjectPriority,
			updatedPriorities,
			newPriorities,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const deleteProjectPriority = asyncHandler(async (req, res) => {
	try {
		const { priorityId, workspaceId } = req.params;

		const customProjectPriority = await prisma.customProjectPriority.findUnique(
			{
				where: { id: priorityId, workspaceId },
			}
		);

		if (!customProjectPriority) {
			return res.status(404).json({
				message: `CustomProjectPriority ${priorityId} not found`,
			});
		}

		// Find and delete associated ProjectPriorities first
		await prisma.projectPriority.deleteMany({
			where: {
				customProjectPriorityId: priorityId,
			},
		});
		// Delete the custom status list and its associated task priority
		await prisma.customProjectPriority.delete({
			where: { id: priorityId, workspaceId },
		});

		res.status(204).json({
			message:
				'CustomProjectPriority and associated ProjectPriorities deleted successfully',
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export {
	createProjectPriority,
	getProjectPriority,
	getProjectPriorityById,
	updateProjectPriority,
	deleteProjectPriority,
};
