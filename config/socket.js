const socketIo = require("socket.io");

const _ = require("lodash");
let io;

function initialize(server) {
  io = socketIo(server, {
    cors: {
      origin: "*", // Replace with the correct port
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  // io.use((socket, next) => {
  //   const token = socket.handshake.auth?.token;
  //   if (!token) return next(new Error("Access token required"));
  //   try {
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET || "Chinmoy@crj93");
  //     socket.user = decoded; // attach user to socket
  //     next();
  //   } catch (err) {
  //     return next(new Error("Invalid or expired token"));
  //   }
  // });
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    console.log("Client connected:", socket?.user);
    socket.on("send_message", (data) => {
      console.log("data", data);
      const msg = {
        from: socket.id,
        text: data,
        timestamp: Date.now(),
      };
      console.log("Received:", msg);
      io.emit("receive_message", msg); // Broadcast to all clients
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

function getIo() {
  return io;
}

module.exports = { initialize, getIo };
