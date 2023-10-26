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
export const employeeMember = employeeRoleBasedMiddleware(['MEMBER']);
export const employeeAdmin = employeeRoleBasedMiddleware(['ADMIN']);
export const employeeOwner = employeeRoleBasedMiddleware(['OWNER']);
export const employeeGuest= employeeRoleBasedMiddleware(['GUEST']);

// Middleware for Member or Admin roles
export const employeeMemberAndAdmin = employeeRoleBasedMiddleware(['MEMBER', 'ADMIN']);

// Middleware that includes all roles (MEMBER, ADMIN, OWNER)
export const allEmployeeRoles = employeeRoleBasedMiddleware(['MEMBER', 'ADMIN', 'OWNER']);

export {
  employeeMember,
employeeAdmin,
employeeOwner,
employeeGuest,
employeeMemberAndAdmin,
allEmployeeRoles
  
}