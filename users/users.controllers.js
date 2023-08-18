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

export { getSingleUser, getAllUsers };
