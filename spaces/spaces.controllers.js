import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create a new space
const createSpace = asyncHandler(async (req, res) => {
  const { workspaceId: workspaceId } = req.params;
  const { id: userId } = req.user;
  const { title, avatar } = req.body;
  try {
    console.log("workspaceId", workspaceId);
    // check if the title exist in the workspace
    const existingSpace = await prisma.space.findFirst({
      where: { title, workspaceId },
    });

    if (existingSpace) {
      return res.status(400).json({ error: `space ${title} already exists` });
    }
    const space = await prisma.space.create({
      data: {
        title,
        avatar,
        userId,
        workspaceId,
      },
    });

    res.status(201).json(space);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Get all spaces
const getAllSpaces = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const spaces = await prisma.space.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        projects: {
          select: {
            id: true,
          },
        },

        tasks: {
          select: {
            id: true,
          },
        },
      },
    });

    res.status(200).json(spaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get space by ID
const getSpaceById = asyncHandler(async (req, res) => {
  const { id, workspaceId } = req.params;
  try {
    const space = await prisma.space.findUnique({
      where: {
        id,
        workspaceId,
      },
      include: {
        projects: {
          select: {
            id: true,
          },
        },

        tasks: {
          select: {
            id: true,
          },
        },
      },
    });
    if (!space) {
      return res.status(404).json({ message: `space  ${id} not found` });
    }
    res.status(200).json(space);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update space by ID
const updateSpace = asyncHandler(async (req, res) => {
  const { workspaceId, id } = req.params;
  try {
    const existingSpace = await prisma.space.findUnique({
      where: {
        id,
        workspaceId,
      },
    });
    if (!existingSpace) {
      return res.status(404).json({ message: `space  ${id} not found` });
    }
    const space = await prisma.space.update({
      where: {
        id,
        workspaceId,
      },
      data: req.body,
    });
    if (!space) {
      return res.status(404).json({ message: `space  ${id} not found` });
    }
    res.status(200).json(space);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete space by ID
const deleteSpace = asyncHandler(async (req, res) => {
  const { id, workspaceId } = req.params;
  try {
    const existingSpace = await prisma.space.findUnique({
      where: {
        id,
        workspaceId,
      },
    });
    if (!existingSpace) {
      return res.status(404).json({ message: `space  ${id} not found` });
    }

    await prisma.space.delete({
      where: {
        id,
        workspaceId,
      },
    });

    res.status(204).json(`space ${id} deleted `);
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: error.message });
  }
});

export { createSpace, deleteSpace, getAllSpaces, getSpaceById, updateSpace };
