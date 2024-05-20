import asyncHandler from "express-async-handler";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Create a new notification
const createNotification = asyncHandler(async (req, res) => {
  const { message } = req.body;

  try {
    // Create the notification in the database
    const newNotification = await prisma.notification.create({
      data: {
        employee: { connect: { id: req.employeeId } },
        message,
      },
    });

    res.status(201).json(newNotification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch all notifications for the user
const getNotifications = asyncHandler(async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        employeeId: req.employeeId,
      },
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Mark a notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  try {
    const updatedNotification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });

    res.status(200).json(updatedNotification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  try {
    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    res.status(204).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
};
