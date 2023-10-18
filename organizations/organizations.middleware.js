import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const checkOrganizationExists = async (req, res, next) => {
  const { orgId } = req.params;
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!organization) {
      return res.status(404).json({ error: `Organization ${orgId} not found` });
    }

    // Attach the organization object to the request
    req.organization = organization;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
