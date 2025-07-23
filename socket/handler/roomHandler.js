module.exports = function roomHandler(io, socket) {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    console.log(`${socket.id} joined room ${roomName}`);
    socket.to(roomName).emit("room_joined", {
      user: socket.id,
      room: roomName,
    });
  });

  socket.on("leave_room", (roomName) => {
    socket.leave(roomName);
    console.log(`${socket.id} left room ${roomName}`);
  });
};
