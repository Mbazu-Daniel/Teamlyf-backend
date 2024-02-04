import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const checkTaskExists = async (req, res, next) => {
	const { projectId, taskId } = req.params;
	try {
		const task = await prisma.task.findFirst({
			where: { id: taskId, projectId },
		});

		if (!task) {
			return res.status(404).json(`Task ${taskId} not found`);
		}

		next();
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
};
