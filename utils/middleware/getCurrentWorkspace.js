import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getCurrentWorkspace = async (req, res, next) => {
  const { workspaceId } = req.params;
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res
        .status(404)
        .json({ error: `Workspace ${workspaceId} not found` });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
