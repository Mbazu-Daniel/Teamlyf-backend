import express from "express";
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "./organization.controllers.js";

const organizationRouter = express.Router();

organizationRouter.post("/", createOrganization);
organizationRouter.get("/", getAllOrganizations);
organizationRouter.get("/:id", getOrganizationById);
organizationRouter.patch("/:id", updateOrganization);
organizationRouter.delete("/:id", deleteOrganization);

export default organizationRouter;
