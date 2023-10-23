import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// const BASE_URL =

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;

    const lowercaseEmail = email.toLowerCase();

    // Check if the user making the request is a superAdmin
    const currentUser = req.user; // Replace this with your actual user identification method

    if (!currentUser.superAdmin) {
      return res.status(403).json({ error: "Permission denied. Only superAdmin can create isAdmin users." });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lowercaseEmail },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: { email: lowercaseEmail, password: hashedPassword, isAdmin: isAdmin || false },
      });

      return res.status(201).json({ message: "User registered successfully" });
    } else {
      res.status(400).json({ error: "User already exists" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Registration failed" });
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
      .json({ access_token: token });
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


const forgotPassword = asyncHandler(async(req, res) => {
  const {email} = req.body

  // Get the user 
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user) {
    return res.status(200).json({
      msg: "You will receive a reset email if a user with that email exists",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken,
      passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

})
export { loginUser, logoutUser, registerUser };
