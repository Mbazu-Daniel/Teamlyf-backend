import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create a new organizations
const createOrganization = async (req, res) => {
  const { id: createdById } = req.user;
  const { name, address, logo } = req.body;

  // Convert the organization name to lowercase
  const lowercaseName = name.toLowerCase();

  try {
    // Check if an organization with the same name already exists
    const existingOrganization = await prisma.organization.findFirst({
      where: { name: lowercaseName },
    });

    if (existingOrganization) {
      return res
        .status(400)
        .json({ error: `Organization name ${name} already exists.` });
    }

    // Check if a user with the provided email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: req.user.email },
    });

    // Create a new organization with the provided data
    const newOrganization = await prisma.organization.create({
      data: {
        name,
        address,
        logo,
        owner: {
          connect: { id: createdById },
        },
        employees: {
          create: [
            {
              fullName: existingUser.fullName,
              email: existingUser.email,
              role: "Owner",
            },
          ],
        },
      },
    });

    res.status(201).json(newOrganization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all organizations
const getAllOrganizations = asyncHandler(async (req, res) => {
  const { email } = req.user; 
  try {
    const organization = await prisma.organization.findMany({
      where: {
        OR: [
          { createdById: req.user.id },
          { employees: { some: { email: email } } },
        ],
      },
    });
    res.status(200).json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get an Organization by ID
const getOrganizationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return res.status(404).json(`Organization ${id} not found`);
    }

    res.status(200).json(organization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Update an Organization by ID
const updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return res.status(404).json(`Organization ${id} not found`);
    }

    // Check if the user is authorized to update the organization (e.g., user is the owner)
    if (organization.createdById !== req.user.id) {
      return res.status(403).json("Unauthorized to update this organization");
    }

    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: req.body,
    });

    res.status(202).json(updatedOrganization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an organization by ID
const deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      return res.status(404).json(`Organization ${id} not found`);
    }

    // Check if the user is authorized to delete the organization (e.g., user is the owner)
    if (organization.createdById !== req.user.id) {
      return res.status(403).json("Unauthorized to delete this organization");
    }

    await prisma.organization.delete({
      where: { id },
    });

    return res.status(204).json(`Organization ${id} deleted`);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


export {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
