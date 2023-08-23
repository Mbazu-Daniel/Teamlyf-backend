import express from "express";
import { createOrganization } from "./organization.controllers.js";

const organizationRouter = express.Router();

organizationRouter.post("/", createOrganization);

export default organizationRouter;
