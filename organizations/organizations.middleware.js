import Organization from "./organizations.models.js";

export const checkOrganizationExists = async (req, res, next) => {
  const { organizationId } = req.params;

  try {
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res
        .status(404)
        .json({ error: `Organization ${organizationId} not found` });
    }

    // Attach the organization object to the request
    req.organization = organization;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export  checkOrganizationExists;
