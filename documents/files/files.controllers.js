import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import {
  getObjectSignedUrl,
  uploadFile,
} from "../../utils/services/awsS3bucket.js";

import asyncHandler from "express-async-handler";
import {
  doesFileNameFolderExist,
  resolveFileNameConflict,
  generateFileName,
} from "../../utils/helpers/index.js";
const prisma = new PrismaClient();

// TODO: check workspace file storage amount (chat, lms, tasks, project etc)
// TODO: send email notification to workspace admin if file storage limit is reached
// TODO: upgrade workspace file size by purchasing more storage
// TODO: list out employees and their file storage usage

// optional
// TODO: when a file is uploaded, a folder should be created for that worskpace in S3 if it doesn't exist already
// TODO: when a folderId is passed a it should be stored in the workspace and a new folderId created


// Create a new task file
const uploadFileToCloud = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const employeeId = req.employeeId;
  const { folderId } = req.body;

  try {
    //  Handle single or multiple file uploads
    const files = req.files || [req.file];
 

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No file(s) uploaded" });
    }

    const createdFiles = [];

    for (const file of files) {
      // location for aws and path for local testing
      const { mimetype, size, originalname, buffer } = file;

      if (size <= 0) {
        return res.status(400).json({ error: "File size is not correct" });
      }

      // const fileNameExists = await doesFileNameFolderExist(
      //   originalname,
      //   folderId
      // );

      // If the filename exists in the same folder, handle conflict resolution
      let fileName = originalname;
      // if (fileNameExists) {
      fileName = await resolveFileNameConflict(originalname, folderId);
      // }

      // fileIdentifier - random file name to be generated for more security
      const fileIdentifier = generateFileName();

      const path = await getObjectSignedUrl(fileIdentifier);

      // TODO: not using sharp here because this handles different upload file type
      // const fileBuffer = await sharp(file.buffer)
      //     .resize({ height: 1920, width: 1080, fit: "contain" })
      //     .toBuffer();

      // Store the file in S3
      await uploadFile(buffer, fileIdentifier, mimetype);

      const fileData = {
        fileName,
        fileType: mimetype,
        fileSize: size,
        fileUrl: path,
        fileIdentifier,
        workspace: { connect: { id: workspaceId } },
        uploadBy: { connect: { id: employeeId } },
      };

      // Create the file
      const newFile = await prisma.file.create({
        data: fileData,
      });

      // if a file is added to a folder, create a mapping between the file and folder
      if (folderId) {
        await prisma.fileFolderMapping.create({
          data: {
            folderId,
            fileId: newFile.id,
          },
        });
      }

      createdFiles.push(newFile);
    }

    res.status(201).json(createdFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get User's Files
const getUserFiles = asyncHandler(async (req, res) => {
  const employeeId = req.employeeId;
  const { workspaceId } = req.params;

  try {
    const userFiles = await prisma.file.findMany({
      where: {
        workspaceId,
        employeeId,
      },
    });
    res.status(200).json(userFiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get File Details Controller
const getFileDetails = asyncHandler(async (req, res) => {
  const {  fileId } = req.params;
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Update a task file by ID
const updateFileDetails = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { description } = req.body;

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
        id: fileId,
      },
      data: {
        description,
      },
    });

    res.status(200).json(updatedFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


export {
  uploadFileToCloud,
  getFileDetails,
  getUserFiles,
  updateFileDetails,
};
