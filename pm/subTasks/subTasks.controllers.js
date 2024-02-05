import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

const prisma = new PrismaClient();
// Create a new subtask
const createSubtask = asyncHandler(async (req, res) => {
	const { taskId } = req.params;
	const { title, startDate, dueDate, status, priority, collaboratorsId } =
		req.body;

	try {
		if (!title) {
			return res.status(400).json({ error: 'Title is required' });
		}

		const subtaskData = {
			title,
			startDate: startDate || new Date(),
			dueDate: dueDate || null,
			// taskStatus: status ? { connect: { id: status } } : null,
			// taskPriority: priority ? { connect: { id: priority } } : null,
			tasks: { connect: { id: taskId } },
			createdBy: { connect: { id: req.employeeId } },
		};

		const newSubtask = await prisma.subtask.create({
			data: subtaskData,
		});

		if (collaboratorsId && collaboratorsId.length > 0) {
			for (const collaborator of collaboratorsId) {
				await prisma.subsubtaskCollaborator.create({
					data: {
						taskId: taskId,
						employeeId: collaborator,
					},
				});
			}
		}

		res.status(201).json(newSubtask);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: error.message });
	}
});

// Get all subtasks for a task
const getAllSubtasks = asyncHandler(async (req, res) => {
	const { taskId } = req.params;

	try {
		const subtasks = await prisma.subtask.findMany({
			where: {
				taskId,
			},
		});

		res.status(200).json(subtasks);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Update subtask by ID
const updateSubtask = asyncHandler(async (req, res) => {
	const { id, taskId } = req.params;

	const { title, startDate, dueDate, status, priority, collaboratorsId } =
		req.body;

	try {
		const subtask = await prisma.subtask.findUnique({
			where: {
				id,
			},
		});

		if (!subtask) {
			return res.status(404).json({ message: `Subtask ${id} not found` });
		}

		if (subtask.taskId !== taskId) {
			return res.status(404).json({
				message: `Subtask ${id} does not belong to the specified task`,
			});
		}

		const subtaskData = {
			title,
			startDate: startDate || new Date(),
			dueDate: dueDate || null,
			taskStatusId: status,
			taskPriorityId: priority,
		};

		const updatedSubtask = await prisma.subtask.update({
			where: {
				id,
			},
			data: subtaskData,
		});

		res.status(200).json(updatedSubtask);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Delete subtask by ID
const deleteSubtask = asyncHandler(async (req, res) => {
	const { id, taskId } = req.params;

	try {
		const subtask = await prisma.subtask.findUnique({
			where: {
				id,
			},
		});

		if (!subtask) {
			return res.status(404).json({ message: `Subtask ${id} not found` });
		}

		if (subtask.taskId !== taskId) {
			return res.status(404).json({
				message: `Subtask ${id} does not belong to the specified task`,
			});
		}

		// Delete the subtask if it exists
		await prisma.subtask.delete({
			where: {
				id,
			},
		});

		res.status(204).json({ message: 'Subtask deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Add collaborators to tasks
const addCollaboratorsToSubTask = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { employeeIds } = req.body;

	try {
		// Check if employeeIds are valid and exist in the Employee table
		const validEmployeeIds = await prisma.employee.findMany({
			where: {
				id: {
					in: employeeIds,
				},
			},
		});

		if (validEmployeeIds.length !== employeeIds.length) {
			return res.status(400).json({
				message: 'One or more employeeIds are invalid or do not exist.',
			});
		}

		// Check if collaborators already exist for the specified task and employeeIds
		const existingCollaborators = await prisma.subtaskCollaborator.findMany({
			where: {
				id,
				employeeId: {
					in: employeeIds,
				},
			},
		});

		if (existingCollaborators.length > 0) {
			return res.status(400).json({
				message: 'One or more collaborators already exist for this task.',
			});
		}

		// Create SubtaskCollaborator entries for each employee and connect them to the task
		for (const employeeId of employeeIds) {
			await prisma.subtaskCollaborator.create({
				data: {
					id,
					employeeId,
				},
			});
		}

		res.status(200).json({ message: 'Collaborators added to the task' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Remove collaborators from a task
const removeCollaboratorsFromSubTask = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { employeeIds } = req.body;

	try {
		// Remove SubtaskCollaborator entries for each specified employee
		const deleteResults = await prisma.subtaskCollaborator.deleteMany({
			where: {
				id,
				employeeId: {
					in: employeeIds,
				},
			},
		});

		if (deleteResults.count === 0) {
			return res.status(404).json({
				message: 'No matching collaborators found for the specified subtask',
			});
		}

		res.status(200).json({ message: 'Collaborators removed from the subtask' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export {
	createSubtask,
	deleteSubtask,
	getAllSubtasks,
	updateSubtask,
	addCollaboratorsToSubTask,
	removeCollaboratorsFromSubTask,
};
