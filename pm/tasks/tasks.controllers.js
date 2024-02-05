import { PrismaClient, TaskAction } from '@prisma/client';
import asyncHandler from 'express-async-handler';
const prisma = new PrismaClient();

// TODO: get tasks assigned to me
// TODO: get tasks for a particular user
// TODO: CRUD for TaskAttachments
// TODO: get tasks history
// TODO: get user task counts
const taskSelectOptions = {
	id: true,
	title: true,
	description: true,
	notifications: true,
	startDate: true,
	dueDate: true,
	reminderDate: true,
	tags: true,
	taskStatus: { select: { name: true, color: true } },
	taskPriority: { select: { name: true, color: true } },
	createdBy: { select: { fullName: true } },
	createdAt: true,
	projects: { select: { name: true } },

	taskCollaborators: {
		select: {
			employee: {
				select: {
					fullName: true,
				},
			},
		},
	},
	subtasks: true,
	taskComments: true,
	taskFiles: true,
};

// Create a new task
const createTask = asyncHandler(async (req, res) => {
	const { workspaceId, projectId } = req.params;
	const {
		title,
		description,
		tagList,
		startDate,
		dueDate,
		priority,
		status,
		reminderDate,
		taskCollaborators,
	} = req.body;

	try {
		const taskData = {
			title,
			description: description || '',
			startDate: startDate || new Date(),
			dueDate: dueDate || null,
			reminderDate: reminderDate || null,
			taskStatus: { connect: { id: status } },
			// taskPriority: { connect: { id: priority } },
			tags: tagList || null,
			createdBy: { connect: { id: req.employeeId } },
			projects: { connect: { id: projectId } },
			workspaces: { connect: { id: workspaceId } },
		};

		const newTask = await prisma.task.create({
			data: taskData,
		});

		// Log task addition in history using Prisma
		await prisma.taskHistory.create({
			data: {
				tasks: { connect: { id: newTask.id } },
				employee: { connect: { id: req.employeeId } },
				action: TaskAction.CREATED_TASKS,
			},
		});

		if (taskCollaborators && taskCollaborators.length > 0) {
			// Create TaskCollaborator entries for each collaborator and connect them to the task
			for (const collaboratorId of taskCollaborators) {
				await prisma.taskCollaborator.create({
					data: {
						taskId: newTask.id,
						employeeId: collaboratorId,
					},
				});
			}

			await prisma.taskHistory.create({
				data: {
					tasks: { connect: { id: newTask.id } },
					employee: { connect: { id: req.employeeId } },
					action: TaskAction.TASKS_COLLABORATOR_ADDED,
				},
			});
		}

		res.status(201).json(newTask);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: error.message });
	}
});

// Get all tasks in workspace
const getAllTasksInWorkspace = asyncHandler(async (req, res) => {
	const { workspaceId } = req.params;
	try {
		const tasks = await prisma.task.findMany({
			where: {
				workspaceId,
			},
			select: taskSelectOptions,
		});
		res.status(200).json(tasks);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Get all tasks in a project
const getAllTasks = asyncHandler(async (req, res) => {
	const { workspaceId, projectId } = req.params;
	try {
		const tasks = await prisma.task.findMany({
			where: {
				workspaceId,
				projectId,
			},
			select: taskSelectOptions,
		});
		res.status(200).json(tasks);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error });
	}
});

// Get single task in a project by task ID
const getTaskById = asyncHandler(async (req, res) => {
	const { taskId, projectId } = req.params;
	try {
		const task = await prisma.task.findFirst({
			where: {
				id: taskId,
				projectId,
			},
			select: taskSelectOptions,
		});
		if (!task) {
			return res.status(404).json({ message: `Task  ${taskId} not found` });
		}
		res.status(200).json(task);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Update task by ID
const updateTask = asyncHandler(async (req, res) => {
	const { taskId } = req.params;
	const {
		title,
		description,
		tagList,
		dueDate,
		priority,
		status,
		reminderDate,
	} = req.body;

	try {
		const taskData = {
			title,
			description: description || '',
			dueDate: dueDate || null,
			reminderDate: reminderDate || null,
			taskStatusId: status,
			taskPriorityId: priority,
			tags: tagList || null,
		};

		const updatedTask = await prisma.task.update({
			where: {
				id: taskId,
			},
			data: taskData,
			select: taskSelectOptions,
		});

		res.status(200).json(updatedTask);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Delete task by ID
const deleteTask = asyncHandler(async (req, res) => {
	const { taskId, projectId } = req.params;
	try {
		await prisma.task.delete({
			where: {
				id: taskId,
			},
		});

		res.status(204).json({ message: 'Task deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Get task count in the workspace
const getTaskCountInWorkspace = asyncHandler(async (req, res) => {
	const { workspaceId } = req.params;

	try {
		// Get the count of tasks in the workspace
		const taskCount = await prisma.task.count({
			where: {
				workspaceId,
			},
		});

		res.status(200).json({ count: taskCount });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Add collaborators to tasks
const addCollaboratorsToTask = asyncHandler(async (req, res) => {
	const { taskId } = req.params;
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
		const existingCollaborators = await prisma.taskCollaborator.findMany({
			where: {
				taskId,
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

		// Create TaskCollaborator entries for each employee and connect them to the task
		for (const employeeId of employeeIds) {
			await prisma.taskCollaborator.create({
				data: {
					taskId,
					employeeId,
				},
			});

			await prisma.taskHistory.create({
				data: {
					tasks: { connect: { id: taskId } },
					employee: { connect: { id: req.employeeId } },
					action: TaskAction.TASKS_COLLABORATOR_ADDED,
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
const removeCollaboratorsFromTask = asyncHandler(async (req, res) => {
	const { taskId } = req.params;
	const { employeeIds } = req.body;

	try {
		// Remove TaskCollaborator entries for each specified employee
		const deleteResults = await prisma.taskCollaborator.deleteMany({
			where: {
				taskId: taskId,
				employeeId: {
					in: employeeIds,
				},
			},
		});

		if (deleteResults.count === 0) {
			return res.status(404).json({
				message: 'No matching collaborators found for the specified task',
			});
		}

		await prisma.taskHistory.create({
			data: {
				tasks: { connect: { id: taskId } },
				employee: { connect: { id: req.employeeId } },
				action: TaskAction.TASKS_COLLABORATOR_REMOVED,
			},
		});

		res.status(200).json({ message: 'Collaborators removed from the task' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export {
	createTask,
	deleteTask,
	getAllTasksInWorkspace,
	getAllTasks,
	getTaskById,
	updateTask,
	addCollaboratorsToTask,
	removeCollaboratorsFromTask,
	getTaskCountInWorkspace,
};
