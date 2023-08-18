import User from "../users/users.models.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const findUser = await User.findOne({ email });

  if (!findUser) {
    const newUser = await User.create({
      ...req.body,
      email: email,
    });
    try {
      return res.status(201).json(newUser);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Unable to sign up, please try again" });
    }
  } else {
    res.status(400).json({ error: "User already exists" });
  }
});

export { registerUser };
