import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import asyncHandler from 'express-async-handler';
const prisma = new PrismaClient();

const createProjectStatus = asyncHandler(async (req, res) => {
	const { name, color } = req.body;

	try {
		const projectStatus = await prisma.projectStatus.create({
			data: {
				name,
				color,
			},
		});

		res.status(201).json(projectStatus);
	} catch (error) {
		console.error(error);
		res.status(400).json({ error: error.message });
	}
});

const getAllProjectStatus = asyncHandler(async (req, res) => {
	try {
		const projectStatusList = await prisma.projectStatus.findMany();
		res.status(200).json(projectStatusList);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const getProjectStatusById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	try {
		const projectStatus = await prisma.projectStatus.findUnique({
			where: {
				id,
			},
		});

		if (!projectStatus) {
			return res.status(404).json({ message: `ProjectStatus ${id} not found` });
		}

		res.status(200).json(projectStatus);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const updateProjectStatus = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { name, color } = req.body;

	try {
		const updatedProjectStatus = await prisma.projectStatus.update({
			where: {
				id,
			},
			data: {
				name,
				color,
			},
		});

		res.status(200).json(updatedProjectStatus);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

const deleteProjectStatus = asyncHandler(async (req, res) => {
	const { id } = req.params;

	try {
		const projectStatus = await prisma.projectStatus.findUnique({
			where: {
				id,
			},
		});

		if (!projectStatus) {
			return res.status(404).json({ message: `ProjectStatus ${id} not found` });
		}

		await prisma.projectStatus.delete({
			where: {
				id,
			},
		});

		res.status(204).json({ message: 'ProjectStatus deleted successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
});

export {
	createProjectStatus,
	getAllProjectStatus,
	getProjectStatusById,
	updateProjectStatus,
	deleteProjectStatus,
};
