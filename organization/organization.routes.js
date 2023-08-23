import express from "express";
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  
} from "./organization.controllers.js";

const organizationRouter = express.Router();

organizationRouter.post("/", createOrganization);
organizationRouter.get("/", getAllOrganizations);
organizationRouter.get("/:id", getOrganizationById);
organizationRouter.patch("/:id", updateOrganization);

export default organizationRouter;
