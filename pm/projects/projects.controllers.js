import { PrismaClient, ProjectAction} from '@prisma/client';
import asyncHandler from 'express-async-handler';

const prisma = new PrismaClient();

// TODO: When a project is a created a chat group should be created for that Project with the name of the project
// TODO: create an analytics for project where projects tasks that are not equal to a default status will be calculated against a default task status and from there we can see the progress bar of the projects
// TODO: include progress bar in the project
// TODO: by default every project is created with the status as "New Project" but when it has at least one tasks it can update to "In Progress"
// TODO: filter project by project priority, project status,

const projectSelectOptions = {
	createdAt: true,
	id: true,
	workspace: { select: { name: true } },
	name: true,
	description: true,
	thumbnail: true,
	isFavourite: true,
	projectProgress: true,
	startDate: true,
	dueDate: true,
	customTaskStatus: { select: { name: true } },
	projectPriority: { select: { name: true } },
	projectStatus: { select: { name: true } },
	projectCreator: { select: { fullName: true } },

	projectCollaborators: {
		select: {
			employee: {
				select: {
					fullName: true,
				},
			},
		},
	},
	tasks: true,
};
// Create a new project
const createProject = asyncHandler(async (req, res) => {
	const { workspaceId } = req.params;
	const initialStatus = 'New Project';
	const initialColor = '#00ff00';
	const {
		 
		name,
		description,
		thumbnail,
		category,
		startDate,
		dueDate,
		collaboratorIds,
		customTaskStatusId,
		projectPriorityId,
	} = req.body;
	try {
	
		// Check if ProjectStatus with the given name already exists
		let projectStatus = await prisma.projectStatus.findUnique({
			where: {
				name: initialStatus.toLowerCase(),
			},
		});

		if (!projectStatus) {
			// If ProjectStatus doesn't exist, create a new one with initial values
			projectStatus = await prisma.projectStatus.create({
				data: {
					name: initialStatus.toLowerCase(),
					color: initialColor,
				},
			});
		}

		const newProject = await prisma.project.create({
			data: {
				name,
				description: description || null,
				thumbnail: thumbnail || null,
				category: category || null,
				startDate: startDate || new Date(),
				dueDate: dueDate || null,
				projectCreator: { connect: { id: req.employeeId } },
				customTaskStatus: { connect: { id: customTaskStatusId } },
				projectPriority: { connect: { id: projectPriorityId } },
				projectStatus: { connect: { id: projectStatus.id } },
				workspace: { connect: { id: workspaceId } },
			},
			select: projectSelectOptions,
		});

		// Log project addition in history using Prisma
		await prisma.projectHistory.create({
			data: {
				projects: { connect: { id: newProject.id } },
				employee: { connect: { id: req.employeeId } },
				action: ProjectAction.CREATED_PROJECTS,
			},
		});

		if (collaboratorIds && collaboratorIds.length > 0) {
			// Create ProjectCollaborator entries for each collaborator and connect them to the project
			for (const collaboratorId of collaboratorIds) {
				await prisma.projectCollaborator.create({
					data: {
						projectId: newProject.id,
						employeeId: collaboratorId,
					},
				});
			}
			await prisma.projectHistory.create({
				data: {
					projects: { connect: { id: newProject.id } },
					employee: { connect: { id: req.employeeId } },
					action: ProjectAction.PROJECTS_COLLABORATOR_ADDED,
				},
			});
		}

		res.status(201).json(newProject);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: error.message });
	}
});

// Get all projects
const getAllProjects = asyncHandler(async (req, res) => {
	const { workspaceId } = req.params;
	try {
		const projects = await prisma.project.findMany({
			where: {
				workspaceId,
			},
			select: projectSelectOptions,
		});

		res.status(200).json(projects);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Get project by ID
const getProjectById = asyncHandler(async (req, res) => {
	const { projectId } = req.params;
	try {
		const project = await prisma.project.findUnique({
			where: {
				projectId,
			},
			select: projectSelectOptions,
		});
		if (!project) {
			return res
				.status(404)
				.json({ message: `Project  ${projectId} not found` });
		}
		res.status(200).json(project);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Update project by ID
const updateProject = asyncHandler(async (req, res) => {
	const { projectId } = req.params;
	try {
		const existingProject = await prisma.project.findUnique({
			where: {
				projectId,
			},
		});
		if (!existingProject) {
			return res
				.status(404)
				.json({ message: `Project  ${projectId} not found` });
		}
		const project = await prisma.project.update({
			where: {
				projectId,
			},
			data: req.body,

			select: projectSelectOptions,
		});
		if (!project) {
			return res
				.status(404)
				.json({ message: `Project  ${projectId} not found` });
		}
		res.status(200).json(project);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// Delete project by ID
const deleteProject = asyncHandler(async (req, res) => {
	const { projectId } = req.params;
	try {
		const existingProject = await prisma.project.findUnique({
			where: {
				projectId,
			},
		});
		if (!existingProject) {
			return res
				.status(404)
				.json({ message: `Project  ${projectId} not found` });
		}

		await prisma.project.delete({
			where: {
				projectId,
			},
		});

		res.status(204).json(`Project ${projectId} deleted `);
	} catch (error) {
		console.error(error);

		res.status(500).json({ error: error.message });
	}
});

const addCollaboratorsToProject = asyncHandler(async (req, res) => {
	const { projectId } = req.params;
	const { employeeIds } = req.body;

	try {
		const project = await prisma.project.findUnique({
			where: {
				id: projectId,
			},
		});

		if (!project) {
			return res
				.status(404)
				.json({ message: `Project ${projectId} not found` });
		}

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

		// Check if collaborators already exist for the specified project and employeeIds
		const existingCollaborators = await prisma.projectCollaborator.findMany({
			where: {
				projectId,
				employeeId: {
					in: employeeIds,
				},
			},
		});

		if (existingCollaborators.length > 0) {
			return res.status(400).json({
				message: 'One or more collaborators already exist for this project.',
			});
		}

		// Create ProjectCollaborator entries for each employee and connect them to the project
		for (const employeeId of employeeIds) {
			await prisma.projectCollaborator.create({
				data: {
					projectId,
					employeeId,
				},
			});

			await prisma.projectHistory.create({
				data: {
					projects: { connect: { id: projectId } },
					employee: { connect: { id: req.employeeId } },
					action: ProjectAction.PROJECTS_COLLABORATOR_ADDED,
				},
			});
		}

		res.status(200).json({ message: 'Collaborators added to the project' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const removeCollaboratorsFromProject = asyncHandler(async (req, res) => {
	const { projectId } = req.params;
	const { employeeIds } = req.body;

	try {
		const project = await prisma.project.findUnique({
			where: {
				id: projectId,
			},
		});

		if (!project) {
			return res
				.status(404)
				.json({ message: `Project ${projectId} not found` });
		}

		// Remove ProjectCollaborator entries for each specified employee
		const deleteResults = await prisma.projectCollaborator.deleteMany({
			where: {
				projectId: projectId,
				employeeId: {
					in: employeeIds,
				},
			},
		});

		if (deleteResults.count === 0) {
			return res.status(404).json({
				message: 'No matching collaborators found for the specified project',
			});
		}
		await prisma.projectHistory.create({
			data: {
				projects: { connect: { id: projectId } },
				employee: { connect: { id: req.employeeId } },
				action: ProjectAction.PROJECTS_COLLABORATOR_REMOVED,
			},
		});

		res.status(200).json({ message: 'Collaborators removed from the project' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

// const calculateProjectProgress = asyncHandler(async (req, res) => {
//   const { projectId } = req.params;
//   try {
//     const project = await prisma.project.findUnique({
//       where: {
//         id: projectId,
//       },
//     });
//     if (!project) {
//       return res.status(404).json({ error: "Project not found" });
//     }

//     const totalTasks = project.tasks.length;
//     const completedTasks = project.tasks.filter(
//       (task) =>
//         // task.status === TaskStatus.COMPLETED ||
//         // task.status === TaskStatus.CANCELED
//     ).length;

//     // Calculate the project progress as a percentage
//     const projectProgress = (completedTasks / totalTasks) * 100;

//     // Update the project progress in the database
//     await prisma.project.update({
//       where: {
//         id: projectId,
//       },
//       data: {
//         projectProgress,
//       },
//     });

//     return res.status(200).json({ projectProgress });
//   } catch {
//     console.error(error);
//     return res.status(500).json({ error: error.message });
//   }
// });

export {
	addCollaboratorsToProject,
	createProject,
	deleteProject,
	getAllProjects,
	getProjectById,
	removeCollaboratorsFromProject,
	updateProject,
	// calculateProjectProgress
};
