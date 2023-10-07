import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import sendMail from "../services/sendMail.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const url = "http://localhost/api/v1";

const generateInviteLink = asyncHandler(async (req, res) => {
  let { email, role } = req.body;
  const { orgId } = req.params;
  email = email.toLowerCase();

  try {
    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if the email already exists in the organization
    const existingEmployee = await prisma.employee.findFirst({
      where: { email, orgId },
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ error: "Email already exists in the organization" });
    }

    // Generate unique token
    const inviteToken = uuidv4();

    // Set expiration date
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    // Save the invite link with the organization relationship
    await prisma.Invite.create({
      data: {
        token: inviteToken,
        email,
        role,
        organization: { connect: { id: orgId } },
        expirationDate: expireDate,
      },
    });

    // Send an email with the invite link
    const mailOptions = {
      from: "TeamLyf <onboarding@resend.dev>",
      to: email,
      subject: "Invitation to Join Organization",
      html: `
          <div class="container" style="max-width: 90%; margin: auto; padding-top: 20px">
            <h2>You have been invited to join an organization.</h2>
            <p>Click the following link to accept the invitation:</p>
            <a href="${url}/join/${inviteToken}">Accept Invitation</a>
          </div>
        `,
    };

    // Sending the invitation email
    const data = await sendMail(mailOptions);

    res.status(201).json({ inviteToken, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const joinOrganization = asyncHandler(async (req, res) => {
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

    // Check if the organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: invite.orgId },
    });

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If the user doesn't exist, create a new user
    if (!existingUser) {
      existingUser = await prisma.user.create({
        data: {
          email: lowercasedEmail,
          password: hashedPassword,
          organizations: { connect: { id: invite.orgId } },
        },
      });
    } else {
      // If the user already exists, add the organization to their organizations array
      existingUser = await prisma.user.update({
        where: { email: lowercasedEmail },
        data: {
          organizations: {
            connect: { id: invite.orgId },
          },
        },
      });
    }

    // Create a new employee record
    const newEmployee = await prisma.employee.create({
      data: {
        fullName,
        email: lowercasedEmail,
        organization: { connect: { id: organization.id } },
        role: invite.role,
      },
    });

    // Add the new employee to the organization's employee array
    await prisma.organization.update({
      where: { id: organization.id },
      data: {
        employees: { connect: { id: newEmployee.id } },
      },
    });

    // Delete the invite link as it has been used
    await prisma.invite.deleteMany({
      where: { token: inviteToken },
    });

    res.status(200).json({ user: newEmployee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { generateInviteLink, joinOrganization };
