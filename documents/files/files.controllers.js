import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create a new task file
const uploadFile = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const employeeId = req.employeeId;
  const { source, description, sourceId, folderId } = req.body;

  try {
    //  Handle single or multiple file uploads
    const files = req.files || [req.file];
    console.log("🚀 ~ uploadFile ~ files:", files);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No file(s) uploaded" });
    }

    const createdFiles = [];

    for (const file of files) {
      const { fileName, fileType, fileSize, fileFormat, fileUrl } = file;

      const fileData = {
        fileName,
        fileType,
        fileSize,
        fileFormat,
        fileUrl,
        source,
        sourceId,
        description,
        workspace: { connect: { id: workspaceId } },
        uploadBy: { connect: { id: employeeId } },
      };

      // If folderId is provided, add file to Folder
      if (folderId) {
        fileData.folder = { connect: { id: folderId } };
      }

      // Create the file
      const newFile = await prisma.file.create({
        data: fileData,
      });

      createdFiles.push(newFile);
    }

    res.status(201).json(newFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
});

export { uploadFile };
