import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkTeamExists = async (req, res, next) => {
  const { workspaceId, teamId } = req.params;
  try {
    const team = await prisma.team.findFirst({
      where: { id: teamId, workspaceId },
    });

    if (!team) {
      return res.status(404).json(`Team ${teamId} not found`);
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
