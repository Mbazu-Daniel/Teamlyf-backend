import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// TODO: update deleteUser to remove user from all the organization they are part of as well as delete the user
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
    res.status(200).json(user);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
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

    return res.status(204).json("User has been deleted.");
  } catch (err) {
    throw new Error(err);
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, phone } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: { name, phone } },
      { new: true }
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ message: `User with the specified ID ${id} was not found` });
    }
    res.status(202).json(updatedUser);
  } catch (err) {
    throw new Error(err);
  }
});
export { getSingleUser, getAllUsers, updateUser, deleteUser };
