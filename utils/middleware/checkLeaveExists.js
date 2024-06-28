import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const checkLeaveExists = async (req, res, next) => {
	const { workspaceId, leaveId } = req.params;
	try {
		const leave = await prisma.leave.findFirst({
			where: { id: leaveId, workspaceId },
		});

		if (!leave) {
			return res.status(404).json(`Leave ${leaveId} not found`);
		}

		next();
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: error.message });
	}
};
