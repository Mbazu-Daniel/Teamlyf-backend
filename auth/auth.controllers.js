import asyncHandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const lowercaseEmail = email.toLowerCase();

    // check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lowercaseEmail },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: { email: lowercaseEmail, password: hashedPassword },
      });

      return res.status(201).json({ message: "User registered successfully" });
    } else {
      res.status(400).json({ error: "User already exists" });
    }
  } catch (error) {
    console.error(error);
    // res.status(500).json({ message: "Registration failed" });
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
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });
    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({ message: `${email} logged in successfully` });
  } catch (error) {
    console.error({ error: "An error occurred while logging in" });
  }
});

const logoutUser = asyncHandler((req, res) => {
  res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Logged out successfully" });
});
export { registerUser, loginUser, logoutUser };
