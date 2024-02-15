import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import Joi from 'joi';
dotenv.config();

// Validation schema for generating invite link
const generateInviteLinkSchema = Joi.object({
	email: Joi.string().email().required(),
	role: Joi.string().valid('OWNER', 'ADMIN', 'MEMBER').required(),
});

// Middleware for validating generate invite link request
const validateGenerateInviteLink = asyncHandler(async (req, res, next) => {
	try {
		await generateInviteLinkSchema.validateAsync(req.body);
		next();
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// Validation schema for joining workspace
const joinWorkspaceSchema = Joi.object({
	fullName: Joi.string().required(),
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required(),
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

export { validateGenerateInviteLink, validateJoinWorkspace };
