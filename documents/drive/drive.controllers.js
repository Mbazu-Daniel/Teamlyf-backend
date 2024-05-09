// this controller handles other file manager functionalities

import asyncHandler from "express-async-handler";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const markAsStarred = asyncHandler(async (req, res) => {
  try {
    const { itemId, itemType } = req.body;

    if (itemType === "folder") {
      // Mark folder as starred
      await prisma.folder.update({
        where: { id: itemId },
        data: { isStarred: true },
      });

      res.status(200).json({ msg: "Folder marked as starred successfully" });
    } else if (itemType === "file") {
      // Mark file as starred
      await prisma.file.update({
        where: { id: itemId },
        data: { isStarred: true },
      });

      res.status(200).json({ msg: "File marked as starred successfully" });
    } else {
      res.status(400).json({ error: "Invalid item type" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export { markAsStarred };
