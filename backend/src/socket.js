import { Server } from "socket.io";

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined room: ${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export { initSocket, getIO };