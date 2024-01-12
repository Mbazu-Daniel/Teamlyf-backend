import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import sendMail from "../../helper/services/sendMail.js";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();

// TODO: Update this code to send template
// TODO: fix the bug on this code with the one on Ovasite
// TODO: new users and employee to be added to the platform or workspace through the workspace invite code
// TODO: function to regenerate workspace inviteCode

// TODO: function to leave a workspace (this should not CASCADE delete, the user information should still be available)

const url = process.env.FRONTEND_URL;

const generateInviteLink = asyncHandler(async (req, res) => {
  let { email, role } = req.body;
  const { workspaceId } = req.params;
  email = email.toLowerCase();

  try {
    // Generate unique token
    const inviteToken = uuidv4();

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
            <a href="${url}/join/${inviteToken}">Accept Invitation</a>
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
  try {
    // Find the invite link in the database using Prisma
    const invite = await prisma.invite.findFirst({
      where: { token: inviteToken },
    });

    if (!invite || invite.expirationDate < new Date()) {
      return res
        .status(404)
        .json({ error: "Invite link not found or expired" });
    }

    const invitedEmail = invite.email.toLowerCase();

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
          workspace: { connect: { id: workspace.id } },
          role: invite.role,
          user: { connect: { id: existingUser.id } },
        },
      });
      const toDeleteInvite = await prisma.invite.findFirst({
        where: { token: inviteToken },
      });
      await prisma.invite.delete({
        where: { id: toDeleteInvite.id, token: inviteToken },
      });
      return res.status(200).json(newEmployee);
    }

    if (!fullName || email || !password) {
      return res
        .status(400)
        .json({ error: "Full name, email and password are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
        workspace: { connect: { id: workspace.id } },
        role: invite.role,
        user: { connect: { id: newUser.id } },
      },
    });

    const toDeleteInvite = await prisma.invite.findFirst({
      where: { token: inviteToken },
    });

    await prisma.invite.delete({
      where: {
        id: toDeleteInvite.id,
        token: inviteToken,
      },
    });

    res.status(200).json(newEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export { generateInviteLink, joinWorkspace };
