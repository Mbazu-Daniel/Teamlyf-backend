import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import sendMail from "../services/sendMail.js";

const prisma = new PrismaClient();

const url = "http://localhost:8000/api/v1";

const generateInviteLink = asyncHandler(async (req, res) => {
  let { email, role } = req.body;
  const { workspaceId: workspaceId } = req.params;
  email = email.toLowerCase();

  try {
    // Check if the workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "workspace not found" });
    }

    // Check if the email already exists in the workspace
    const existingEmployee = await prisma.employee.findFirst({
      where: { email, workspaceId },
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ error: "Email already exists in the workspace" });
    }

    // Generate unique token
    const inviteToken = uuidv4();

    // Set expiration date
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    // Save the invite link with the workspace relationship
    await prisma.Invite.create({
      data: {
        token: inviteToken,
        email,
        role,
        expirationDate: expireDate,
        workspace: { connect: { id: workspaceId } },
        invitedBy: { connect: {id: req.employeeId  } },
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
  const lowercasedEmail = email.toLowerCase();

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

    // Check if the provided email matches the one associated with the invite link
    if (lowercasedEmail !== invite.email) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // Check if the user already exists with this email
    let existingUser = await prisma.user.findUnique({
      where: { email: lowercasedEmail },
    });

    // Check if the workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: invite.workspaceId },
    });

    if (!workspace) {
      return res.status(404).json({ error: "workspace not found" });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If the user doesn't exist, create a new user
    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          email: lowercasedEmail,
          password: hashedPassword,
          workspaces: { connect: { id: invite.workspaceId } },
        },
      });
    } else {
      // If the user already exists, add the workspace to their workspaces array
      existingUser = await prisma.user.update({
        where: { email: lowercasedEmail },
        data: {
          workspaces: {
            connect: { id: invite.workspaceId },
          },
        },
      });
    }

    // Create a new employee record
    const newEmployee = await prisma.employee.create({
      data: {
        fullName,
        email: lowercasedEmail,
        workspace: { connect: { id: workspace.id } },
        role: invite.role,
        user: { connect: { id: existingUser.id } },
      },
    });

    // Add the new employee to the workspace's employee array
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        employees: { connect: { id: newEmployee.id } },
      },
    });

    // Delete the invite link as it has been used
    await prisma.invite.deleteMany({
      where: { token: inviteToken },
    });

    res.status(200).json( newEmployee );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export { generateInviteLink, joinWorkspace };
