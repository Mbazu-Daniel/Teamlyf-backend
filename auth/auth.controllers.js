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

const loginUser = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Incorrect email or password!" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(401).json("Wrong password or email!");
    }
  } catch (error) {
    console.error(error);
  }
});
export { registerUser, loginUser };
