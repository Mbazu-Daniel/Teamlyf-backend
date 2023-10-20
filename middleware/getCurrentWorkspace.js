import { PrismaClient } from "@prisma/client";

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
        .json({ error: `workspace ${workspaceId} not found` });
    }

    // Attach the workspace object to the request
    req.workspaces = workspace;

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
