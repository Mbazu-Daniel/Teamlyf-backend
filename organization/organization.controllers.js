import Organization from "./organization.models.js";
import asyncHandler from "express-async-handler";

// Create a new organization
const createOrganization = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      country,
      state,
      city,
      address1,
      address2,
      image,
      size,
      created_by,
    } = req.body;

    const newOrganization = await Organization.create({
      name,
      description,
      country,
      state,
      city,
      address1,
      address2,
      image,
      size,
      created_by,
    });

    res.status(201).json(newOrganization);
  } catch (error) {
    throw new Error(error);
  }
});

export { createOrganization };
