import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import asyncHandler from "express-async-handler";
import sendMail from "../../utils/services/sendMail.js";

import {
  generateUniqueId,
  generateHashedPassword,
} from "../../utils/helpers/index.js";

import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();

// TODO: Update this code to send template
// TODO: new users and employee to be added to the platform or workspace through the workspace invite code
// TODO: controller to regenerate workspace inviteCode
// TODO: controller to generate shareable link
// TODO: controller to add user to workspace through the generated link
// TODO: controller to leave a workspace (this should not CASCADE delete, the user information should still be available)

const FRONTEND_URL = process.env.FRONTEND_URL;
const SALT = process.env.SALT;
const generateInviteLink = asyncHandler(async (req, res) => {
  let { email, role } = req.body;
  const { workspaceId } = req.params;
  email = email.toLowerCase();

  try {
    // Generate unique token
    const inviteToken = generateUniqueId();

    // Set expiration date
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    // Save the invite link with the workspace relationship
    await prisma.invite.create({
      data: {
        token: inviteToken,
        email,
        role,
        expirationDate: expireDate,
        workspace: { connect: { id: workspaceId } },
        invitedBy: { connect: { id: req.employeeId } },
      },
    });

    // Send an email with the invite link
    const mailOptions = {
      from: "TeamLyf <onboarding@resend.dev>",
      to: email,
      subject: "Invitation to Join workspace",
      html: `
          <div class="container" style="max-width: 90%; margin: auto; padding-top: 20px">
            <h2>You have been invited to join an workspace.</h2>
            <p>Click the following link to accept the invitation:</p>
            <a href="${FRONTEND_URL}/join/${inviteToken}">Accept Invitation</a>
          </div>
        `,
    };

    // Sending the invitation email
    const data = await sendMail(mailOptions);

    res.status(201).json({ inviteToken, data, msg: "Invitation sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const joinWorkspace = asyncHandler(async (req, res) => {
  const { inviteToken } = req.params;
  const { fullName, email, password } = req.body;
  console.log("🚀 ~ joinWorkspace ~ password:", password);
  try {
    // get invite from the token
    const invite = await prisma.invite.findFirst({
      where: { token: inviteToken },
    });

    if (!invite || invite.expirationDate < new Date()) {
      return res
        .status(404)
        .json({ error: "Invite link not found or expired" });
    }

    const invitedEmail = invite.email.toLowerCase();

    // Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { email: invitedEmail },
    });

    // If the user doesn't exist, prompt user to provide details
    if (existingUser) {
      // Create a new employee record
      const newEmployee = await prisma.employee.create({
        data: {
          fullName: fullName || null,
          email: invitedEmail,
          workspace: { connect: { id: invite.workspaceId } },
          role: invite.role,
          user: { connect: { id: existingUser.id } },
        },
      });

      await prisma.invite.delete({
        where: { id: invite.id },
      });
      return res.status(200).json(newEmployee);
    }

    // Validate input fields for new user creation
    if (!fullName || !password) {
      return res
        .status(400)
        .json({ error: "Full name and password are required" });
    }

    console.log("🚀 ~ joinWorkspace ~ password:", password);
    // Create a new user and employee profile
    const hashedPassword = await generateHashedPassword(password, SALT);

    const newUser = await prisma.user.create({
      data: {
        email: invitedEmail,
        password: hashedPassword,
      },
    });

    const newEmployee = await prisma.employee.create({
      data: {
        fullName,
        email: invitedEmail,
        workspace: { connect: { id: invite.workspaceId } },
        role: invite.role,
        user: { connect: { id: newUser.id } },
      },
    });

    await prisma.invite.delete({
      where: {
        id: invite.id,
      },
    });

    res.status(200).json(newEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export { generateInviteLink, joinWorkspace };
