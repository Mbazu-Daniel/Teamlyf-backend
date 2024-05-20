import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function doesFileNameFolderExist(fileName, folderId) {
  try {
    const existingFile = await prisma.fileFolderMapping.findFirst({
      where: {
        folderId,
        file: { fileName },
      },
    });
    return existingFile !== null;
  } catch (error) {
    console.error("Error checking filename and folder existence", error);
    throw new Error("Failed to check filename and folder existence");
  }
}

async function doesFileNameExist(fileName) {
  try {
    const existingFile = await prisma.file.findFirst({
      where: {
        fileName,
      },
    });

    // Check if there is a mapping for the filename with a folder
    // const existingMapping = await prisma.fileFolderMapping.findFirst({
    //   where: {
    //     file: { fileName },
    //     NOT: {
    //       folderId: null,
    //     },
    //   },
    // });
    return existingFile !== null;
    // return existingFile !== null && existingMapping === null;
  } catch (error) {
    console.error("Error checking filename existence:", error);
    throw new Error("Failed to check filename existence");
  }
}

async function resolveFileNameConflict(fileName, folderId) {
  let resolvedFileName = fileName;
  let counter = 1;

  while (true) {
    let fileExistsInFolder = false;
    let fileExistsWithoutFolder = false;

    if (folderId) {
      fileExistsInFolder = await doesFileNameFolderExist(
        resolvedFileName,
        folderId
      );
    } else {
      fileExistsWithoutFolder = await doesFileNameExist(resolvedFileName);
    }

    if (fileExistsInFolder || fileExistsWithoutFolder) {
      const fileExtension = resolvedFileName.split(".").pop();
      const baseFileName = resolvedFileName.replace(`.${fileExtension}`, "");

      resolvedFileName = `${baseFileName} (${counter}).${fileExtension}`;
      counter++;
      console.log(
        "🚀 ~ resolveFileNameConflict ~ resolvedFileName:",
        resolvedFileName
      );
    } else {
      break;
    }
  }

  return resolvedFileName;
}
export { doesFileNameFolderExist, resolveFileNameConflict };
