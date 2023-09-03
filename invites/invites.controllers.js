import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import Invite from "./invites.models.js";
import Employee from "../employees/employees.models.js";
import Organization from "../organizations/organizations.models.js";
import bcrypt from "bcrypt";
import sendMail from "../services/sendMail.js";

const url = "http://localhost/api/v1";

const generateInviteLink = asyncHandler(async (req, res) => {
  const { organizationId, email } = req.body;

  try {
    // Check if the organization exists
    const organization = await Organization.findById(organizationId);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if the email already exists in the organization
    const existingEmployee = await Employee.findOne({
      email,
      organization: organizationId,
    });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ error: "Email already exists in the organization" });
    }

    // generate unique token
    const inviteToken = uuidv4();

    // set expiration date
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    // save the invite link
    const invite = new Invite({
      token: inviteToken,
      email: email,
      organization: organizationId,
      expireDate,
    });
    await invite.save();

    // Send an email with the invite link
    const mailOptions = {
      from: "noreply@teamlyf.com",
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
    // sending the invitation
    await sendMail(mailOptions);

    res.status(201).json({ inviteToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const joinOrganization = asyncHandler(async (req, res) => {
  const { inviteToken } = req.params;
  const { fullName, email, password } = req.body;

  try {
    // TODO:
    // check if the email has already joined the organization

    // Find the invite link in the database
    const invite = await Invite.findOne({ token: inviteToken });

    if (!invite || invite.expirationDate < new Date()) {
      return res
        .status(404)
        .json({ error: "Invite link not found or expired" });
    }

    // Check if the provided email matches the one associated with the invite link
    if (email !== invite.email) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    // check if the organization exists
    const organization = await Organization.findById(invite.organization);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // hash the users password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new employee record
    const newEmployee = new Employee({
      fullName,
      email,
      password: hashedPassword,
      organization: organization._id,
      role: "Member",
    });

    // Save the new employee record to the database
    await newEmployee.save();

    // Add the new employee to the organization's employee array
    organization.employees.push(newEmployee._id);
    await organization.save();

    // Delete the invite link as it has been used
    await invite.deleteOne();

    // Send a confirmation email to the employee
    const mailOptions = {
      from: "noreply@teamlyf.com",
      to: email,
      subject: `Welcome to ${organization.name}!`,
      html: `
              <div class="container" style="max-width: 90%; margin: auto; padding-top: 20px">
            <h2> Welcome ${newEmployee.fullName} </h2>
            <p>We are glad to have you join our organization</p>
              </div> 
            `,
    };
    await sendMail(mailOptions);
    res.status(200).json({ user: newEmployee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { generateInviteLink, joinOrganization };
