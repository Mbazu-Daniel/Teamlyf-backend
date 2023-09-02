import express from "express";
import {
  createOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} from "./organizations.controllers.js";
import {
  verifyAdmin,
  verifyUser,
  verifyToken,
} from "../middleware/authenticate.js";

const organizationsRouter = express.Router();

organizationsRouter.post("/", verifyToken, createOrganization);
organizationsRouter.get("/", getAllOrganizations);
organizationsRouter.get("/:id", getOrganizationById);
organizationsRouter.patch("/:id", updateOrganization);
organizationsRouter.delete("/:id", deleteOrganization);

export default organizationsRouter;
