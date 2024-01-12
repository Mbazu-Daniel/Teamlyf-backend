import { EmployeeRole, PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import ShortUniqueId from "short-unique-id";

const prisma = new PrismaClient();
// TODO: total count of workspace in the platform
// TODO: set permission for update and delete workspace to only employee with Admin and owner role
// TODO: check existing workspace based on the current user and not general workspaces
const { randomUUID } = new ShortUniqueId({ length: 10 });

// Create a new workspace
const createWorkspace = asyncHandler(async (req, res) => {
  const { name, logo, address } = req.body;
  const { id: userId, email } = req.user;

  try {
    // Check if an workspace with the same name already exists
    const existingWorkspace = await prisma.workspace.findFirst({
      where: { name },
    });

    if (existingWorkspace) {
      return res
        .status(400)
        .json({ error: `workspace name ${name} already exists.` });
    }

    // Check if a user with the provided email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res
        .status(400)
        .json({ error: `User does not exist with email: ${email}` });
    }


    // Create a new workspace with the provided data
    const newWorkspace = await prisma.workspace.create({
      data: {
        name: name,
        logo: logo || null,
        address: address || null,
        inviteCode: randomUUID(),
        userId,
      },
    });

    // Create a new employee associated with the user who created the workspace
   await prisma.employee.create({
      data: {
        email: email,
        role: EmployeeRole.OWNER,
        user: { connect: { id: userId } },
        workspace: { connect: { id: newWorkspace.id } },
      },
    });

    res.status(201).json(newWorkspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all workspaces
const getUserWorkspaces = asyncHandler(async (req, res) => {
  const { email, id } = req.user;
  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [{ userId: id }, { employees: { some: { email } } }],
      },
    });

    // Check if the user is not part of any workspaces
    if (workspaces.length === 0) {
      return res
        .status(200)
        .json({ message: "You're not a part of any workspace" });
    }
    res.status(200).json(workspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an workspace by ID
const getWorkspaceById = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id:workspaceId },
      include: {
        employees: {
          select: { id: true, email: true },
        },
      },
    });

    if (!workspace) {
      res.status(404).json(`workspace ${id} not found`);
    }

    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update an workspace by ID
const updateWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const {name} = req.body

  try {

    // Update the workspace data
    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name
      },
    });

    res.status(202).json(updatedWorkspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete an workspace by ID
const deleteWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;

  try {
  
    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    res.status(204).json(`workspace ${workspaceId} deleted`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const getWorkspaceOwners = asyncHandler(async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: {
        role: EmployeeRole.OWNER, 
      },
    });
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Controller to transfer ownership
const transferWorkspaceOwnership = asyncHandler(async (req, res) => {
  try {
    const { newOwnerId } = req.body;
    const currentOwnerId = req.employeeId;

    // Update the ownership in the database
    await prisma.employee.update({
      where: { id: currentOwnerId },
      data: {
        role: EmployeeRole.MEMBER,
      },
    });

    await prisma.employee.update({
      where: { id: newOwnerId },
      data: {
        role: EmployeeRole.OWNER,
      },
    });

    res.status(200).json({ message: "Ownership transferred successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Controller to leave a workspace
const leaveWorkspace = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  console.log("🚀 ~ file: workspaces.controllers.js:204 ~ leaveWorkspace ~ id:", workspaceId)
  
  try {

    const user = await prisma.employee.findFirst({
      where: {
        workspaceId,
        id: req.employeeId,
        role: {
          in: [EmployeeRole.OWNER,EmployeeRole.MEMBER, EmployeeRole.ADMIN, EmployeeRole.GUEST],
        },
      },
    });
    console.log("🚀 ~ file: workspaces.controllers.js:216 ~ leaveWorkspace ~ user:", user)
    console.log("🚀 ~ file: workspaces.controllers.js:215 ~ leaveWorkspace ~ req.employeeId:", req.employeeId)
    
    
    if (!user) {
      return res
        .status(404)
        .json({ error: "You're not a member of this workspace." });
    }
    
    if (user.role === EmployeeRole.OWNER) {
      return res
        .status(400)
        .json({
          error: "Owners cannot leave the workspace. Transfer ownership first.",
        });
    }
    
    // Continue with removing the user from the workspace
    await prisma.employee.delete({
      where: {
        id: employeeId,
        workspaceId: id,
      },
    });
    
    res
      .status(200)
      .json({ message: "You have left the workspace successfully." });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


export {
  createWorkspace,
  deleteWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  getWorkspaceOwners,
  leaveWorkspace,
  transferWorkspaceOwnership,
  updateWorkspace,
};
