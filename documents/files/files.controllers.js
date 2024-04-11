import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import asyncHandler from "express-async-handler";

const prisma = new PrismaClient();

// Create a new task file
const uploadFile = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const employeeId = req.employeeId;
  const { fileName, fileType, fileSize, fileFormat, fileUrl } = req.file;
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

// Get File Details Controller
const getFileDetails = asyncHandler(async (req, res) => {
  const { workspaceId, fileId } = req.params;
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
        workspaceId,
      },
    });

    if (!file) {
      return res
        .status(404)
        .json({ error: `File with id ${fileId} not found` });
    }
  } catch (error) {
    console.error(error);
  }
  res.status(200).json(file);
});

// Get User's Files
const getUserFiles = asyncHandler(async (req, res) => {
  const employeeId = req.employeeId;

  try {
    const userFiles = await prisma.file.findMany({
      where: {
        uploadBy: {
          id: employeeId,
        },
      },
    });
    res.status(200).json(userFiles);
  } catch (error) {
    console.error(error);
  }
  res.status(200).json(userFiles);
});



// Update a task file by ID
const updateFileDetails = asyncHandler(async (req, res) => {
  const { fileId, workspaceId } = req.params;
  const { originalname, size, mimetype } = req.file;

  try {
    // Check if the task file exists
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return res
        .status(404)
        .json({ error: `File with id ${fileId} not found` });
    }

    // Update the task file
    const updatedFile = await prisma.file.update({
      where: {
        workspaceId,
        id: fileId,
      },
      data: {
        name: originalname,
        file_type: mimetype,
        file_size: size,
      },
    });

    res.status(200).json(updatedFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a task file by ID
const deleteFile = asyncHandler(async (req, res) => {
  const { workspaceId, fileId } = req.params;

  try {
    // Check if the task file exists
    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      return res
        .status(404)
        .json({ error: `File with id ${fileId} not found` });
    }
    // Delete the task file if it exists
    const deletedFile = await prisma.file.delete({
      where: {
        id: fileId,
        workspaceId,
      },
    });
    if (!deletedFile) {
      res
        .status(404)
        .json({ error: `File with id ${deletedFile.id} not found` });
    }
    res.status(204).json({ message: "file deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export { uploadFile, getFileDetails, getUserFiles, updateFileDetails, deleteFile};


