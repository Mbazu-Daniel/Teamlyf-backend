import User from "../users/users.models.js";
import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const registerUser = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const findUser = await prisma.user.findUnique({ where: { email } });

  if (!findUser) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = await prisma.user.create({
      data: { ...req.body, email: email, password: hashedPassword },
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
    const user = await prisma.user.findUnique({
      where: { email },
    });

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

    // include user information
    const tokenPayload = {
      id: user.id,
      email: user.email,
      password: user.password,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);
    const { password, ...otherDetails } = user;
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ message: `${email} logged in successful` });
  } catch (error) {
    console.error(error);
  }
});

const logoutUser = asyncHandler((req, res) => {
  res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Logged out successfully" });
});
export { registerUser, loginUser, logoutUser };
