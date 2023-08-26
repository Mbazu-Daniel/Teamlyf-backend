import express from "express";
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "./organizations.controllers.js";

const organizationsRouter = express.Router();

organizationsRouter.post("/", createOrganization);
organizationsRouter.get("/", getAllOrganizations);
organizationsRouter.get("/:id", getOrganizationById);
organizationsRouter.patch("/:id", updateOrganization);
organizationsRouter.delete("/:id", deleteOrganization);

export default organizationsRouter;
