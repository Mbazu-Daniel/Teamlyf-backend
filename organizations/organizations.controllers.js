import { EmployeeRole, PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";
import ShortUniqueId from "short-unique-id";

const prisma = new PrismaClient();

const { randomUUID } = new ShortUniqueId({ length: 10 });

// Create a new organization
const createOrganization = asyncHandler(async (req, res) => {
  const { name, logo, address } = req.body;
  const { id: userId, email } = req.user;

  try {
    // Check if an organization with the same name already exists
    const existingOrganization = await prisma.organization.findFirst({
      where: { name },
    });

    if (existingOrganization) {
      return res
        .status(400)
        .json({ error: `Organization name ${name} already exists.` });
    }

    // Check if a user with the provided email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Create a new organization with the provided data
    const newOrganization = await prisma.organization.create({
      data: {
        name: name,
        logo: logo || null,
        address: address || null,
        inviteCode: randomUUID(),
        userId,
      },
    });

    // Create a new employee associated with the user who created the organization
    const newEmployee = await prisma.employee.create({
      data: {
        email: email,
        role: EmployeeRole.OWNER,
        user: { connect: { id: userId } },
        organization: { connect: { id: newOrganization.id } },
      },
    });

    res.status(201).json(newOrganization);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get all organizations
const getAllOrganizations = asyncHandler(async (req, res) => {
  const { email, id } = req.user;
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        OR: [{ userId: id }, { employees: { some: { email } } }],
      },
      include: {
        employees: {
          select: {
            id: true,
          },
        },
      },
    });

    // Check if the user is not part of any organizations
    if (organizations.length === 0) {
      return res
        .status(200)
        .json({ message: "You're not a part of any organization" });
    }
    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an organization by ID
const getOrganizationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        employees: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!organization) {
      res.status(404).json(`Organization ${id} not found`);
    }

    res.status(200).json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update an organization by ID
const updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the organization with the specified ID exists
    const existingOrganization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!existingOrganization) {
      return res
        .status(404)
        .json({ error: `Organization with ID ${id} not found.` });
    }

    // Update the organization data
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: req.body,
    });

    res.status(202).json(updatedOrganization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TODO: handle delete error correctly
// Delete an organization by ID
const deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.organization.delete({
      where: { id },
    });

    res.status(204).json(`Organization ${id} deleted`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
