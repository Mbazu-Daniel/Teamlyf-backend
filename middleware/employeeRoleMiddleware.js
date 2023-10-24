import { PrismaClient } from "@prisma/client";
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Generic role-based middleware function
function employeeRoleBasedMiddleware(allowedRoles) {
  return asyncHandler(async (req, res, next) => {
    const { id: userId } = req.user;
    const { workspaceId } = req.params;

    try {
      // Query the database to check if the user has an associated employee within the workspace
      const employee = await prisma.employee.findFirst({
        where: {
          userId,
          workspaceId,
        },
      });

      if (!employee || !allowedRoles.includes(employee.role)) {
        return res
          .status(403)
          .json({ error: "User does not have the required role in this workspace" });
      }

      // Attach the employee object to the request for further use if needed
      req.employeeId = employee.id;
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}

// Specific role-based middleware functions
export const managerMiddleware = employeeRoleBasedMiddleware(['MANAGER']);
export const adminMiddleware = employeeRoleBasedMiddleware(['ADMIN']);
export const ownerMiddleware = employeeRoleBasedMiddleware(['OWNER']);
export const guestMiddleware = employeeRoleBasedMiddleware(['GUEST']);

// Middleware for Manager or Admin roles
export const managerAndAdminMiddleware = employeeRoleBasedMiddleware(['MANAGER', 'ADMIN']);

// Middleware that includes all roles (MANAGER, ADMIN, OWNER)
export const allRolesMiddleware = employeeRoleBasedMiddleware(['MANAGER', 'ADMIN', 'OWNER']);
