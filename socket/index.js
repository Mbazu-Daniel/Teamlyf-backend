import cookie from "cookie";
import jwt from "jsonwebtoken";
import { ChatEventEnum } from "./constants.js";
import { pkg } from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const mountJoinChatEvent = (socket) => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId) => {
    console.log("User joined the chat. chatId: ", chatId);
    socket.join(chatId);
  });
};

const mountParticipantTypingEvent = (socket) => {
  socket.on(ChatEventEnum.TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
  });
};

const mountParticipantStoppedTypingEvent = (socket) => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

const initializeSocketIO = (io) => {
  return io.on("connection", async (socket) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      let token = cookies?.accessToken;

      if (!token) {
        token = socket.handshake.auth?.token;
      }

      if (!token) {
        console.error("Un-authorized handshake. Token is missing");
        // throw new ApiError(401, "Un-authorized handshake. Token is missing");
      }

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await prisma.employee.findUnique({
        where: {
          id: decodedToken?.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          // Explicitly set these to false to exclude them
          password: false,
          refreshToken: false,
          passwordResetToken: false,
          passwordResetAt: false,
        },
      });

      if (!user) {
        console.error("Un-authorized handshake. Token is invalid");
        // throw new ApiError(401, "Un-authorized handshake. Token is invalid");
      }

      socket.user = user;
      socket.join(user.id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);
      console.log("User connected. userId: ", user.id.toString());

      mountJoinChatEvent(socket);
      mountParticipantTypingEvent(socket);
      mountParticipantStoppedTypingEvent(socket);

      socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
        console.log(`User has disconnected. userId: ${socket.user?.id}`);
        if (socket.user?.id) {
          socket.leave(socket.user.id);
        }
      });
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        error?.message || "Something went wrong while connecting to the socket."
      );
    }
  });
};

const emitSocketEvent = (req, roomId, event, payload) => {
  req.app.get("io").in(roomId).emit(event, payload);
};

export { initializeSocketIO, emitSocketEvent };
