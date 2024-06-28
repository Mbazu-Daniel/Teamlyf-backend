import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const checkProjectExists = async (req, res, next) => {
	const { workspaceId, projectId } = req.params;
	try {
		const project = await prisma.project.findFirst({
			where: { projectId, workspaceId },
		});

		if (!project) {
			return res.status(404).json(`Project ${projectId} not found`);
		}

		next();
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
};
