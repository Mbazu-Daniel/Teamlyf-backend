import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanupDirectMessages() {
  try {
    const messagesToDelete = await prisma.directMessage.findMany({
      where: {
        visibility: {
          none: {
            isVisible: true,
          },
        },
      },
    });

    const messageIdsToDelete = messagesToDelete.map((message) => message.id);

    await prisma.directMessageAttachment.deleteMany({
      where: {
        directMessageId: { in: messageIdsToDelete },
      },
    });

    await prisma.directMessage.deleteMany({
      where: {
        id: { in: messageIdsToDelete },
      },
    });

    console.log(
      `Deleted ${messageIdsToDelete.length} direct messages and their attachments`
    );
  } catch (error) {
    console.error("Error cleaning up direct messages:", error);
  }
}

async function cleanupGroupMessages() {
  try {
    const messagesToDelete = await prisma.groupMessage.findMany({
      where: {
        visibility: {
          none: {
            isVisible: true,
          },
        },
      },
    });

    const messageIdsToDelete = messagesToDelete.map((message) => message.id);

    await prisma.groupMessageAttachment.deleteMany({
      where: {
        groupMessageId: { in: messageIdsToDelete },
      },
    });

    await prisma.groupMessage.deleteMany({
      where: {
        id: { in: messageIdsToDelete },
      },
    });

    console.log(
      `Deleted ${messageIdsToDelete.length} group messages and their attachments`
    );
  } catch (error) {
    console.error("Error cleaning up group messages:", error);
  }
}

async function main() {
  await cleanupDirectMessages();
  await cleanupGroupMessages();
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error in cleanup script:", error);
  prisma.$disconnect();
  process.exit(1);
});
