import asyncHandler from 'express-async-handler';

import Joi from 'joi';

// Validation schema for creating a workspace
const createWorkspaceSchema = Joi.object({
	name: Joi.string().required(),
	logo: Joi.string(),
	address: Joi.string(),
});

// Middleware for validating create workspace request
const validateCreateWorkspace = asyncHandler(async (req, res, next) => {
	try {
		await createWorkspaceSchema.validateAsync(req.body);
		next();
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Validation schema for updating a workspace
const updateWorkspaceSchema = Joi.object({
	name: Joi.string().required(),
});

// Middleware for validating update workspace request
const validateUpdateWorkspace = asyncHandler(async (req, res, next) => {
	try {
		await updateWorkspaceSchema.validateAsync(req.body);
		next();
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Validation schema for joining a workspace using invite code
const joinWorkspaceSchema = Joi.object({
	inviteCode: Joi.string().required(),
});

// Middleware for validating join workspace request
const validateJoinWorkspace = asyncHandler(async (req, res, next) => {
	try {
		await joinWorkspaceSchema.validateAsync(req.body);
		next();
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

export {
	validateCreateWorkspace,
	validateJoinWorkspace,
	validateUpdateWorkspace,
};
