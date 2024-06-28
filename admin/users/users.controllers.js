import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import asyncHandler from 'express-async-handler';

const prisma = new PrismaClient();

// TODO: update deleteUser to remove user from all the workspace they are part of as well as delete the user
// TODO: before the user is deleted, remove the user from all the teams they are a part of
// TODO: users account should be permanently deleted after 30 days of clicking delete
// TODO: user can undo their account deletion
// TODO: the deletion can be a cronJob that will complete after 30days of requesting deletion

const getSingleUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	try {
		const user = await prisma.user.findUnique({
			where: { id: id },
		});

		if (!user) {
			return res
				.status(404)
				.json({ message: `User with the specified ID ${id} was not found` });
		}
		res.status(200).json(user);
	} catch (err) {
		throw new Error(err);
	}
});

const getAllUsers = asyncHandler(async (req, res) => {
	try {
		const { 'user-role': userRole } = req.query;

		if (userRole) {
			const filteredUsers = await prisma.user.findMany({
				where: {
					role: userRole.toUpperCase(), // Assuming roles are stored in uppercase
				},
			});

			res.status(200).json(filteredUsers);
		} else {
			const allUsers = await prisma.user.findMany();
			res.status(200).json(allUsers);
		}
	} catch (err) {
		throw new Error(err);
	}
});

const deleteUser = asyncHandler(async (req, res) => {
	const { id } = req.params;
	try {
		const user = await prisma.user.findFirst({
			where: { id: id },
		});

		if (!user) {
			return res
				.status(404)
				.json({ message: `User with the specified ID ${id} was not found` });
		}
		const deletedUser = await prisma.user.delete({
			where: {
				id,
			},
		});

		if (!deletedUser) {
			return res
				.status(404)
				.json({ message: `User with the specified ID ${id} was not found` });
		}

		return res.status(204).json('User has been deleted.');
	} catch (err) {
		throw new Error(err);
	}
});

const getUserByEmail = asyncHandler(async (req, res) => {
	const { email } = req.query;
	try {
		const user = await prisma.user.findFirst({
			where: { email: email },
		});

		if (!user) {
			return res
				.status(404)
				.json({ message: `User with the specified ID ${email} was not found` });
		}
		res.status(200).json(user);
	} catch (err) {
		throw new Error(err);
	}
});
export { deleteUser, getAllUsers, getSingleUser, getUserByEmail };
