import express from "express";
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
} from "./organization.controllers.js";

const organizationRouter = express.Router();

organizationRouter.post("/", createOrganization);
organizationRouter.get("/", getAllOrganizations);
organizationRouter.get("/:id", getOrganizationById);

export default organizationRouter;
