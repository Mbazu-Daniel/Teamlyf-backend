import { PrismaClient,UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import generateResetToken from "../services/generateResetToken.js";
import sendMail from "../services/sendMail.js";

const prisma = new PrismaClient();

const BASE_URL = `http://localhost:${process.env.PORT}`

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;

    const lowercaseEmail = email.toLowerCase();


    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lowercaseEmail },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: { email: lowercaseEmail, password: hashedPassword, role: UserRole.USER},
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

const registerAdminUser = asyncHandler(async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const lowercaseEmail = email.toLowerCase();

    // Check if the user making the request is a superAdmin
    const currentUser = req.user; // Replace this with your actual user identification method

    if (!currentUser.role === UserRole.SUPER_ADMIN) {
      return res.status(403).json({ error: "Permission denied. Only superAdmin can create isAdmin users." });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lowercaseEmail },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: { email: lowercaseEmail, password: hashedPassword, role },
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
      role: user.role
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: "1h",
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

const forgetPassword = asyncHandler(async(req, res) => {
  try {
    const {id: userId} = req.user
    const {email} = req.body
    const lowercaseEmail = email.toLowerCase();
  // Get the user 
  const existingUser  = await prisma.user.findUnique(
    { where: { email: lowercaseEmail } });

  if (!existingUser ) {
   return res.status(404).json({ message: 'User not found' });

  }
  const resetToken = generateResetToken()


  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: resetToken,
      passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const resetLink = `${BASE_URL}/reset-password/${resetToken}`

  const mailOptions = {
  from: "TeamLyf <onboarding@resend.dev>",
   to: email,
   subject: 'Password Reset',
   html: `Click <a href="${resetLink}">here</a> to reset your password.`,
 };


 const data = await sendMail(mailOptions);

 return res.status(200).json({ resetToken, data, message: 'Password reset link sent successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Password reset link sending failed' });
  }
})
const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find the user by their reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: resetToken,
        passwordResetAt: {
          gte: new Date(Date.now() - 3600000), // Password reset token expires after 1 hour
        },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash the new password and update the user's password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null, // Clear the reset token after password reset
        passwordResetAt: null, // Clear the reset timestamp
      },
    });

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Password reset failed' });
  }
});



export { loginUser, logoutUser, registerUser , registerAdminUser,forgetPassword, resetPassword };
