import asyncHandler from "express-async-handler";
import { v4 as uuidv4 } from "uuid";
import Invite from "./invites.models.js";
import Employee from "../employees/employees.models.js";
import User from "../users/users.models.js";
import Organization from "../organizations/organizations.models.js";
import bcrypt from "bcrypt";
import sendMail from "../services/sendMail.js";

// TODO: send invite link with the role you want to give to the user

const url = "http://localhost/api/v1";

const generateInviteLink = asyncHandler(async (req, res) => {
  const { email, organizationId } = req.body;
  // const { organizationId } = req.params;

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
    // sending the invitation
    const data = await sendMail(mailOptions);

    res.status(201).json({ inviteToken, data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const joinOrganization = asyncHandler(async (req, res) => {
  const { inviteToken } = req.params;
  const { fullName, email, password } = req.body;

  try {
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

    // Check if the user already exists with this email
    let user = await User.findOne({ email });

    // Check if the organization exists
    const organization = await Organization.findById(invite.organization);

    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // If the user doesn't exist, create a new user
    if (!user) {
      user = new User({
        email,
        password: hashedPassword,
        organizations: [invite.organization],
      });

      // Save the new user record to the database
      await user.save();
    } else {
      // If the user already exists, add the organization to their organizations array
      user.organizations.push(invite.organization);
      await user.save();
    }

    // Create a new employee record
    const newEmployee = new Employee({
      fullName,
      email,
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

    res.status(200).json({ user: newEmployee });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// TODO: run a cronjob that will clean out the invitation database every week

export { generateInviteLink, joinOrganization };
