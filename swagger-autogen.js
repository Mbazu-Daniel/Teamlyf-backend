import swaggerAutogen from "swagger-autogen";
import dotenv from "dotenv";
dotenv.config();
const outputFile = "./swagger.json";
const endpointsFiles = ["./*/*/*.routes.js"];

const config = {
  info: {
    title: "Teamlyf API Documentation",
    description:
      "Welcome to TeamLyf, the ultimate solution for seamless collaboration and enhance teamwork within your organization. Our platform integrates essential tools including HR Management, Chat Application, Video Conferencing, Task/Project Management, and Document Management System into a single, user-friendly interface. TeamLyf provides an integrated solution to foster collaboration and productivity.",
    version: "1.0.0",
  },

  servers: [
    {
      url: "http://localhost:8000/api/v1",
      description: "local testing server",
    },
    {
      url: "https://teamlyf.cyclic.app/api/v1",
      description: "cyclic testing server",
    },
    {
      url: "https://teamlyf.onrender.com/api/v1",
      description: "render testing server",
    },
  ],
  tags: [
    "Auth",
    "Users",
    "Workspace",
    "Invite",
    "Employees",
    "Teams",
    "Project",
    "Leave",
    "Leave Comment",
    "Leave Type",
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },

    schemas: {
      LoginRequest: {
        $email: "example@gmail.com",
        $password: "password",
      },

      UpdateProjectDetails: {
        $name: "string",
        $description: "string",
        $thumbnail: "string",
        $category: "string",
        $startDate: "string",
        $dueDate: "string",
        $collaboratorIds: "string",
        $customTaskStatusId: "string",
        $projectPriorityId: "string",
      },

      RemoveProjectCollaborators: {
        $employeeIds: "string",
      },
      RemoveGroupCollaborators: {
        $memberIds: "string",
      },
      TaskCount: {
        $workspaceId: "string",
      },
    },
  },
  schemes: ["http", "https"],
};

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, config);
