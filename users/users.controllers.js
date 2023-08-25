import User from "./users.models.js";
import asyncHandler from "express-async-handler";

const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    throw new Error(err);
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    throw new Error(err);
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);

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
